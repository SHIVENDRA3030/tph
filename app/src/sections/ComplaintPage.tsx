import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { gsap } from 'gsap';
import {
  MessageSquare,
  MapPin,
  AlertTriangle,
  Send,
  CheckCircle,
  Phone,
  User,
  FileText,
  X,
  Upload,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Complaint } from '@/types';
import { cn } from '@/lib/utils';

const complaintTypes = [
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-alert-red' },
  { id: 'hazard', label: 'Hazard', icon: Shield, color: 'text-alert-yellow' },
  { id: 'infrastructure', label: 'Infrastructure', icon: FileText, color: 'text-alert-blue' },
  { id: 'other', label: 'Other', icon: MessageSquare, color: 'text-muted-foreground' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'text-alert-yellow bg-alert-yellow/20' },
  in_progress: { label: 'In Progress', color: 'text-alert-blue bg-alert-blue/20' },
  resolved: { label: 'Resolved', color: 'text-alert-green bg-alert-green/20' },
};

interface ComplaintPageProps {
  user: any;
}

export default function ComplaintPage({ user }: ComplaintPageProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComplaints: Complaint[] = (data || []).map(item => ({
        id: item.id.toString(),
        type: item.type,
        title: item.title,
        description: item.description,
        location: {
          address: item.address || 'Unknown Location',
          lat: 0, // Placeholder, usually would parse item.location
          lng: 0
        },
        status: item.status,
        submittedAt: new Date(item.created_at)
      }));
      setComplaints(formattedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.complaint-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 80%',
          },
        }
      );
    }, formRef);

    return () => ctx.revert();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    contactName: user?.user_metadata?.first_name || '',
    contactPhone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('user_reports').insert({
        user_id: user?.id,
        type: selectedType,
        title: formData.title,
        description: formData.description,
        location: `POINT(0 0)`, // Default point since we don't have a map picker yet
        address: formData.address,
        images: images,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        status: 'pending'
      });

      if (error) throw error;

      setSubmitted(true);
      fetchComplaints(); // Refresh list

      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
        setSelectedType('');
        setImages([]);
        setFormData({
          title: '',
          description: '',
          address: '',
          contactName: user?.user_metadata?.first_name || '',
          contactPhone: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  const handleImageUpload = () => {
    // Simulate image upload
    setImages([...images, `https://picsum.photos/200/200?random=${Date.now()}`]);
  };

  return (
    <div ref={formRef} className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-alert-orange/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-alert-orange" />
              </div>
              <h2 className="text-3xl font-bold text-white">Report an Issue</h2>
            </div>
            <p className="text-muted-foreground">
              Report emergencies, hazards, or infrastructure issues in your area
            </p>
          </div>

          <Button
            onClick={() => setShowForm(true)}
            className="bg-alert-orange hover:bg-alert-orange/90"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Emergency Contacts Banner */}
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-alert-red" />
            Emergency Contacts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Emergency', number: '911', color: 'text-alert-red' },
              { label: 'Poison Control', number: '1-800-222-1222', color: 'text-alert-blue' },
              { label: 'Disaster Distress', number: '1-800-985-5990', color: 'text-alert-green' },
            ].map((contact) => (
              <a
                key={contact.label}
                href={`tel:${contact.number.replace(/-/g, '')}`}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="text-sm text-muted-foreground">{contact.label}</p>
                  <p className={cn('text-lg font-semibold', contact.color)}>{contact.number}</p>
                </div>
                <Phone className="w-5 h-5 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mb-8">
          <h3 className="text-white font-semibold mb-4">Recent Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="complaint-card glass rounded-xl p-5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      complaint.type === 'emergency' && 'bg-alert-red/20',
                      complaint.type === 'hazard' && 'bg-alert-yellow/20',
                      complaint.type === 'infrastructure' && 'bg-alert-blue/20',
                      complaint.type === 'other' && 'bg-white/10'
                    )}>
                      {complaint.type === 'emergency' && <AlertTriangle className="w-5 h-5 text-alert-red" />}
                      {complaint.type === 'hazard' && <Shield className="w-5 h-5 text-alert-yellow" />}
                      {complaint.type === 'infrastructure' && <FileText className="w-5 h-5 text-alert-blue" />}
                      {complaint.type === 'other' && <MessageSquare className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{complaint.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(complaint.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    statusConfig[complaint.status].color
                  )}>
                    {statusConfig[complaint.status].label}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {complaint.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{complaint.location.address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !submitted && setShowForm(false)}
            />
            <div className="relative glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-cinematic">
              {submitted ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-alert-green/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-alert-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Report Submitted!</h3>
                  <p className="text-muted-foreground">
                    Thank you for your report. Our team will review it shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitReport} className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Submit a Report</h3>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-3">
                      Type of Issue
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {complaintTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setSelectedType(type.id)}
                            className={cn(
                              'p-3 rounded-xl flex items-center gap-2 transition-all',
                              selectedType === type.id
                                ? 'bg-white/10 ring-1 ring-white/30'
                                : 'bg-white/5 hover:bg-white/10'
                            )}
                          >
                            <Icon className={cn('w-5 h-5', type.color)} />
                            <span className="text-sm text-white">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Brief description of the issue"
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Provide detailed information about the issue..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground min-h-[100px]"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Location
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter address or use current location"
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/20"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Contact Information (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={formData.contactName}
                          onChange={(e) => handleInputChange('contactName', e.target.value)}
                          placeholder="Name"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                          placeholder="Phone"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">
                      Photos (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:border-white/40 transition-colors"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-alert-orange hover:bg-alert-orange/90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Report
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
