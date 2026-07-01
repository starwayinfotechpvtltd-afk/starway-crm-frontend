import React, { useState, useEffect } from "react";
import axios from "axios";
import { Megaphone, Calendar } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

const styles = `
  .notices-view {
    font-family: 'Montserrat', sans-serif;
    min-height: calc(100vh - 70px);
    background-color: #F0F4F8;
    color: #1F2328;
  }
`;

export default function NoticesView() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/notices/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(res.data || []);
    } catch (err) {
      console.error("Failed fetching my notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return (
    <div className="notices-view p-6 md:p-8">
      <style>{styles}</style>
      
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#D1DCEB]/65">
          <div className="w-12 h-12 rounded-xl neu-flat flex items-center justify-center text-[#0969DA]">
            <Megaphone size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Company Announcements</h2>
            <p className="text-xs text-[#656D76]">Keep up-to-date with official policies, updates, and notices from HR.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-[#656D76] uppercase tracking-wider animate-pulse">
            Loading announcements board…
          </div>
        ) : (
          <div className="space-y-6">
            {notices.map(notice => (
              <div key={notice._id} className="neu-flat rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#656D76] uppercase tracking-wider">
                  <Calendar size={12} />
                  <span>
                    {new Date(notice.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug">{notice.title}</h3>
                <p className="text-xs font-medium text-[#656D76] whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="neu-flat rounded-2xl p-12 text-center text-xs font-bold text-[#656D76] italic">
                Announcements board is clear. No active notices.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
