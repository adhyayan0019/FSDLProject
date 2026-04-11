import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, ShieldCheck, Camera } from 'lucide-react';
import { useState, useRef } from 'react';

const Profile = () => {
    const { user, token, API_URL, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64String = reader.result;
            setUploading(true);

            try {
                const res = await fetch(`${API_URL}/api/auth/me/profile-pic`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ profilePic: base64String })
                });

                let data;
                try {
                    data = await res.json();
                } catch (e) {
                    throw new Error("Server returned an unexpected format. Did you remember to fully restart your backend server?");
                }

                if (res.ok) {
                    updateUser(data);
                } else {
                    alert(data.error || 'Failed to trigger upload');
                }
            } catch (err) {
                console.error(err);
                alert(err.message || 'An error occurred during upload.');
            } finally {
                setUploading(false);
            }
        };
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center pt-32">
            <p className="text-xl text-gray-600 font-sans">Please login to view your profile.</p>
        </div>
    );

    return (
        <div className="min-h-screen pt-32 pb-16 px-4 animate-fade-in font-sans flex justify-center">
            <div className="w-full max-w-2xl">
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
                    {/* Top Accent Bar */}
                    <div className="h-32 bg-primary w-full primary-gradient"></div>
                    
                    <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 gap-6 relative">
                        {/* Avatar */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full p-1.5 sm:p-2 shadow-lg relative z-10 group shrink-0">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center text-primary text-4xl sm:text-5xl font-editorial">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}

                            {/* Camera Overlay */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-1.5 sm:inset-2 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera size={28} className={uploading ? "animate-pulse" : ""} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        
                        {/* Title Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-4xl sm:text-5xl font-editorial italic text-gray-900 mb-2">
                                {user.name}
                            </h1>
                            <p className="text-primary font-medium tracking-wide uppercase text-sm flex items-center justify-center sm:justify-start gap-1">
                                <ShieldCheck size={16} /> {user.role || 'customer'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-10 border border-gray-100">
                    <h2 className="text-2xl font-editorial text-gray-900 mb-6 border-b border-gray-100 pb-4">Contact Information</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110">
                                <User size={22} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Full Name</p>
                                <p className="text-lg text-gray-900 font-medium">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110">
                                <Mail size={22} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Email Address</p>
                                <p className="text-lg text-gray-900 font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110">
                                <Phone size={22} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Phone Number</p>
                                <p className="text-lg text-gray-900 font-medium">{user.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
