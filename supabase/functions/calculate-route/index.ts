
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as turf from "https://esm.sh/@turf/turf@6";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority Queue for A*
class PriorityQueue {
    items: any[];
    constructor() { this.items = []; }
    enqueue(item: any, priority: number) {
        this.items.push({ item, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }
    dequeue() { return this.items.shift()?.item; }
    isEmpty() { return this.items.length === 0; }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { start, end, preferences } = await req.json();
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Build Graph (Grid-based for demo)
        const gridSize = 0.005; // ~500m
        const bounds = {
            minLat: Math.min(start.lat, end.lat) - 0.02,
            maxLat: Math.max(start.lat, end.lat) + 0.02,
            minLng: Math.min(start.lng, end.lng) - 0.02,
            maxLng: Math.max(start.lng, end.lng) + 0.02
        };

        const nodes = new Map();
        let nodeId = 0;
        for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += gridSize) {
            for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += gridSize) {
                const id = `node_${nodeId++}`;
                nodes.set(id, { id, lat, lng, connections: [] });
            }
        }

        const nodeArray = Array.from(nodes.values());

        // 2. Fetch Accident Data
        const { data: accidents } = await supabaseClient
            .from('user_reports') // Assuming reports can be hazards/accidents
            .select('location, type') // In real app, might use a dedicated accidents table
            .neq('status', 'resolved');

        // 3. Connect Nodes & Enrich with Risk
        nodeArray.forEach((node: any) => {
            nodeArray.forEach((neighbor: any) => {
                if (node.id === neighbor.id) return;
                const dist = turf.distance([node.lng, node.lat], [neighbor.lng, neighbor.lat], { units: 'kilometers' });

                if (dist <= gridSize * 1.5) {
                    // Calculate Risk
                    let risk = 0.1; // Base risk
                    if (accidents) {
                        accidents.forEach((acc: any) => {
                            // Parse location from string POINT(x y) or object if JSON
                            // Simplified for demo: assume accident location handling
                            // risk += ...
                        });
                    }

                    node.connections.push({ node: neighbor, distance: dist, risk });
                }
            });
        });

        // 4. A* Pathfinding
        const startNode = findNearestNode(nodeArray, start);
        const endNode = findNearestNode(nodeArray, end);

        if (!startNode || !endNode) throw new Error("Endpoints out of bounds");

        const path = aStar(startNode, endNode);

        if (!path) throw new Error("No path found");

        return new Response(JSON.stringify({
            success: true,
            route: {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: path.map((n: any) => [n.lng, n.lat])
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

function findNearestNode(nodes: any[], search: any) {
    let nearest = null;
    let min = Infinity;
    for (const n of nodes) {
        const d = turf.distance([n.lng, n.lat], [search.lng, search.lat]);
        if (d < min) { min = d; nearest = n; }
    }
    return nearest;
}

function aStar(start: any, end: any) {
    const open = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(start.id, 0);
    open.enqueue(start, 0);

    while (!open.isEmpty()) {
        const current = open.dequeue();
        if (current.id === end.id) {
            // Reconstruct
            const path = [current];
            let curr = current;
            while (cameFrom.has(curr.id)) {
                curr = cameFrom.get(curr.id);
                path.unshift(curr);
            }
            return path;
        }

        for (const conn of current.connections) {
            const neighbor = conn.node;
            const tentativeG = gScore.get(current.id) + conn.distance * (1 + conn.risk); // Weight by risk

            if (tentativeG < (gScore.get(neighbor.id) || Infinity)) {
                cameFrom.set(neighbor.id, current);
                gScore.set(neighbor.id, tentativeG);
                const h = turf.distance([neighbor.lng, neighbor.lat], [end.lng, end.lat]);
                fScore.set(neighbor.id, tentativeG + h);
                open.enqueue(neighbor, tentativeG + h);
            }
        }
    }
    return null;
}
