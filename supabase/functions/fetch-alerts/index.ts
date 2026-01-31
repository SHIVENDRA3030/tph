
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
    'Content-Type': 'application/json',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log('Fetching USGS data...');
        // Fetch significant earthquakes in the past hour
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson');
        const data = await response.json();
        const features = data.features;

        console.log(`Found ${features.length} earthquakes.`);

        const alerts = features.map((f: any) => ({
            type: 'earthquake',
            severity: f.properties.mag >= 6 ? 'critical' : 'warning',
            title: f.properties.title,
            description: `Magnitude ${f.properties.mag} earthquake. Depth: ${f.geometry.coordinates[2]}km.`,
            location_text: f.properties.place,
            // Using a simple point string if postgis is enabled, otherwise just store text
            // We'll rely on the database having a suitable column or trigger.
            // For now, we omit the geometry column insert unless we are sure of the format.
            // But we can store coordinates in a JSON column if needed or dedicated lat/lng columns.
            // Let's assume the table has 'location' as geometry and accepts WKT.
            location: `POINT(${f.geometry.coordinates[0]} ${f.geometry.coordinates[1]})`,
            created_at: new Date(f.properties.time).toISOString(),
            expires_at: new Date(f.properties.time + 24 * 3600000).toISOString(), // 24 hours
            instructions: ['Drop, Cover, and Hold On', 'Stay away from windows']
        }));

        if (alerts.length > 0) {
            // Upsert based on title (assuming title is unique enough for this demo)
            // Real implementation should use external_id
            const { error } = await supabaseClient.from('alerts').upsert(
                alerts.map((a: any) => ({ ...a, external_id: a.title })),
                { onConflict: 'external_id' }
            );

            if (error) {
                console.error('Error inserting alerts:', error);
                throw error;
            }
        }

        return new Response(JSON.stringify({ success: true, count: alerts.length }), {
            headers: corsHeaders,
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: corsHeaders,
            status: 500,
        });
    }
});
