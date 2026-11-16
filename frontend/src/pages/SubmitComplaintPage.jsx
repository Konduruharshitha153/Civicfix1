import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Building2, 
  Send, 
  CheckCircle2, 
  X,
  Info
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import MapPicker from '../components/MapPicker';
import AiSuggestionCard from '../components/AiSuggestionCard';
import DuplicateWarningModal from '../components/DuplicateWarningModal';

export default function SubmitComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Categories & Departments
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [affectedCount, setAffectedCount] = useState(1);
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  
  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // AI State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiApplied, setAiApplied] = useState(false);

  // Duplicate Detection State
  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    complaintService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    }).catch(console.error);

    complaintService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  // Trigger AI analysis when requested
  const handleAnalyzeWithAI = async () => {
    if (!title && !description) {
      setErrorMessage('Please enter an issue title or description for AI analysis.');
      return;
    }
    setErrorMessage('');
    setAiAnalyzing(true);
    try {
      const res = await complaintService.aiCategorize(title, description);
      setAiResult(res);
      setAiApplied(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleApplyAiSuggestion = (suggestion) => {
    if (suggestion.suggested_category_id) {
      setCategoryId(suggestion.suggested_category_id);
    }
    if (suggestion.estimated_severity) {
      setSeverity(suggestion.estimated_severity);
    }
    setAiApplied(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocationChange = (loc) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setAddress(loc.address);
  };

  const handleSubmit = async (e, forceProceed = false) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both a title and description.');
      return;
    }

    if (!forceProceed) {
      // Step 1: Pre-flight Duplicate Check
      try {
        const dupRes = await complaintService.checkDuplicates({
          latitude,
          longitude,
          title,
          description,
          category_id: categoryId,
          radius_meters: 350.0,
        });

        if (dupRes.duplicates_count > 0 && dupRes.potential_duplicates[0].overall_match_percentage >= 50) {
          setDuplicateCandidates(dupRes.potential_duplicates);
          setShowDuplicateModal(true);
          return; // pause submission and show warning modal
        }
      } catch (err) {
        console.warn('Duplicate check non-blocking error:', err);
      }
    }

    // Step 2: Final Submission Execution
    setSubmitting(true);
    try {
      let finalImageUrl = null;

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadRes = await complaintService.uploadImage(imageFile);
        finalImageUrl = uploadRes.image_url;
        setUploadingImage(false);
      }

      const payload = {
        title,
        description,
        category_id: Number(categoryId),
        severity,
        affected_count: Number(affectedCount),
        latitude,
        longitude,
        address: address || 'Locality, City',
        landmark,
        image_url: finalImageUrl,
        ai_confidence: aiResult?.confidence ? Math.round(aiResult.confidence * 100) : null,
        ai_suggested_category: aiResult?.category_name || null,
      };

      const res = await complaintService.submitComplaint(payload);
      const trackingNo = res.complaint.tracking_number;

      // Navigate directly to tracking page
      navigate(`/track/${trackingNo}`, {
        state: { newReport: true, trackingNumber: trackingNo }
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to submit complaint. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Issue
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Submit photos and location for road hazards, overflowing garbage, drainage blockages, or faulty streetlights.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        
        {/* Section 1: Issue Details & AI Assist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              1. Issue Description & AI Categorization
            </h2>
            <button
              type="button"
              onClick={handleAnalyzeWithAI}
              disabled={aiAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{aiAnalyzing ? 'Analyzing...' : 'Analyze with AI'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Deep hazardous pothole on 80 Feet Road near Sony World signal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe what is broken, visible hazards, how long it has been there, and traffic impacts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* AI Suggestion Card Presentation */}
          <AiSuggestionCard
            suggestion={aiResult}
            onApply={handleApplyAiSuggestion}
            isApplied={aiApplied}
            loading={aiAnalyzing}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                <option value="Low">Low - Minor Inconvenience</option>
                <option value="Medium">Medium - Regular Attention</option>
                <option value="High">High - Significant Obstruction</option>
                <option value="Critical">Critical - Urgent Safety Hazard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated People Affected
              </label>
              <select
                value={affectedCount}
                onChange={(e) => setAffectedCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white"
              >
                <option value="5">1 - 5 (Immediate household)</option>
                <option value="25">6 - 25 (Street residents)</option>
                <option value="100">26 - 100 (Neighborhood / Ward)</option>
                <option value="500">100+ (Transit corridor / Public)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Photo Evidence */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              2. Photo Evidence
            </h2>
            <p className="text-xs text-slate-500">
              Clear photos enable maintenance engineers to prepare the exact tools and materials required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 16MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-slate-300 shadow-sm shrink-0">
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: OpenStreetMap Location Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">
              3. Interactive OpenStreetMap Location
            </h2>
            <p className="text-xs text-slate-500">
              Pinpoint the issue location on OpenStreetMap for GPS-accurate dispatch.
            </p>
          </div>

          <MapPicker
            initialLat={latitude}
            initialLon={longitude}
            onLocationChange={handleLocationChange}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Landmark or Specific Landmark Clue (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Opposite Metro Pillar 42, near Corporation Bank ATM"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-100 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All submissions receive a persistent tracking ID and public audit log.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting & Routing...' : 'Submit Complaint'}</span>
          </button>
        </div>

      </form>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        duplicates={duplicateCandidates}
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        onProceedAnyway={() => {
          setShowDuplicateModal(false);
          handleSubmit(null, true); // force proceed
        }}
      />

    </div>
  );
}
