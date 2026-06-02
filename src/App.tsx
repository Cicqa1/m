/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import CVBuilder from "./components/CVBuilder";
import JobsBoard from "./components/JobsBoard";
import AuthModal from "./components/AuthModal";
import ProfilePage from "./components/ProfilePage";
import { PolishedCV, User, JobApplication } from "./types";
import { Sparkles, GraduationCap } from "lucide-react";
import mascotLogo from "./assets/images/firststep_new_mascot_logo_1780132225263.png";
import { apiGetUserCVs, apiSaveUserCV, apiDeleteUserCV, apiGetUserApplications, apiSaveUserApplication } from "./lib/api";

export default function App() {
  const [view, setView] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cvList, setCvList] = useState<PolishedCV[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initiallySelectedJobId, setInitiallySelectedJobId] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("firststep_theme") || "mascot";
  });
  const [mode, setMode] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("firststep_mode") as "light" | "dark") || "light";
  });

  // Watch and apply runtime theme design variable tokens matching the specific logo
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "mascot") {
      // Branding Purple & Sky Blue that beautifully pairs with Mascot Rocket
      root.style.setProperty("--brand-primary", "#7B2CBF");
      root.style.setProperty("--brand-primary-hover", "#6A1B9A");
      root.style.setProperty("--brand-secondary", "#00B4D8");
      root.style.setProperty("--brand-secondary-hover", "#0096B1");
      root.style.setProperty("--brand-accent", "#F59E0B");

      if (mode === "light") {
        root.style.setProperty("--brand-primary-light", "#F3E8FF");
        root.style.setProperty("--theme-bg", "#FFFFFF");
        root.style.setProperty("--theme-text", "#0F1F35");
        root.style.setProperty("--theme-text-muted", "#64748B");
        root.style.setProperty("--theme-card-bg", "#FFFFFF");
        root.style.setProperty("--theme-card-border", "rgba(226, 232, 240, 0.8)");
        root.style.setProperty("--theme-input-bg", "#F8FAFC");
        root.style.setProperty("--theme-nav-bg", "rgba(255, 255, 255, 0.95)");
        root.style.setProperty("--theme-nav-text", "#0F1F35");
      } else {
        root.style.setProperty("--brand-primary", "#A78BFA"); // Beautiful high-contrast lavender-violet for dark mode
        root.style.setProperty("--brand-primary-hover", "#C4B5FD");
        root.style.setProperty("--brand-primary-light", "#231238");
        root.style.setProperty("--theme-bg", "#0D0714");
        root.style.setProperty("--theme-text", "#FFFFFF");
        root.style.setProperty("--theme-text-muted", "#94A3B8");
        root.style.setProperty("--theme-card-bg", "#150D1F");
        root.style.setProperty("--theme-card-border", "rgba(255, 255, 255, 0.08)");
        root.style.setProperty("--theme-input-bg", "#08040D");
        root.style.setProperty("--theme-nav-bg", "rgba(13, 7, 20, 0.95)");
        root.style.setProperty("--theme-nav-text", "#FFFFFF");
      }
    } else if (theme === "classic") {
      // Classic Professional Deep Navy Blue
      root.style.setProperty("--brand-primary-hover", "#142842");
      root.style.setProperty("--brand-secondary", "#00B4D8");
      root.style.setProperty("--brand-secondary-hover", "#0096B1");
      root.style.setProperty("--brand-accent", "#F59E0B");

      if (mode === "light") {
        root.style.setProperty("--brand-primary", "#1E3A5F");
        root.style.setProperty("--brand-primary-light", "#EBF5FB");
        root.style.setProperty("--theme-bg", "#FFFFFF");
        root.style.setProperty("--theme-text", "#0F1F35");
        root.style.setProperty("--theme-text-muted", "#64748B");
        root.style.setProperty("--theme-card-bg", "#FFFFFF");
        root.style.setProperty("--theme-card-border", "rgba(226, 232, 240, 0.8)");
        root.style.setProperty("--theme-input-bg", "#F8FAFC");
        root.style.setProperty("--theme-nav-bg", "rgba(255, 255, 255, 0.95)");
        root.style.setProperty("--theme-nav-text", "#0F1F35");
      } else {
        root.style.setProperty("--brand-primary", "#3B82F6");
        root.style.setProperty("--brand-primary-light", "#16233A");
        root.style.setProperty("--theme-bg", "#080C14");
        root.style.setProperty("--theme-text", "#FFFFFF");
        root.style.setProperty("--theme-text-muted", "#94A3B8");
        root.style.setProperty("--theme-card-bg", "#101826");
        root.style.setProperty("--theme-card-border", "rgba(255, 255, 255, 0.08)");
        root.style.setProperty("--theme-input-bg", "#05080F");
        root.style.setProperty("--theme-nav-bg", "rgba(8, 12, 20, 0.95)");
        root.style.setProperty("--theme-nav-text", "#FFFFFF");
      }
    } else if (theme === "emerald") {
      // Premium Academic Mint Forest Green
      root.style.setProperty("--brand-primary-hover", "#0D5C56");
      root.style.setProperty("--brand-secondary", "#10B981");
      root.style.setProperty("--brand-secondary-hover", "#059669");
      root.style.setProperty("--brand-accent", "#FBBF24");

      if (mode === "light") {
        root.style.setProperty("--brand-primary", "#0F766E");
        root.style.setProperty("--brand-primary-light", "#F0FDFA");
        root.style.setProperty("--theme-bg", "#FFFFFF");
        root.style.setProperty("--theme-text", "#0F1F35");
        root.style.setProperty("--theme-text-muted", "#64748B");
        root.style.setProperty("--theme-card-bg", "#FFFFFF");
        root.style.setProperty("--theme-card-border", "rgba(226, 232, 240, 0.8)");
        root.style.setProperty("--theme-input-bg", "#F8FAFC");
        root.style.setProperty("--theme-nav-bg", "rgba(255, 255, 255, 0.95)");
        root.style.setProperty("--theme-nav-text", "#0F1F35");
      } else {
        root.style.setProperty("--brand-primary", "#10B981");
        root.style.setProperty("--brand-primary-light", "#122B24");
        root.style.setProperty("--theme-bg", "#050D0A");
        root.style.setProperty("--theme-text", "#FFFFFF");
        root.style.setProperty("--theme-text-muted", "#94A3B8");
        root.style.setProperty("--theme-card-bg", "#0E1A16");
        root.style.setProperty("--theme-card-border", "rgba(255, 255, 255, 0.08)");
        root.style.setProperty("--theme-input-bg", "#030705");
        root.style.setProperty("--theme-nav-bg", "rgba(5, 13, 10, 0.95)");
        root.style.setProperty("--theme-nav-text", "#FFFFFF");
      }
    } else if (theme === "sunset") {
      // Energetic Youthful Sunset Coral & gold
      root.style.setProperty("--brand-primary-hover", "#BE123C");
      root.style.setProperty("--brand-secondary", "#F97316");
      root.style.setProperty("--brand-secondary-hover", "#EA580C");
      root.style.setProperty("--brand-accent", "#FBBF24");

      if (mode === "light") {
        root.style.setProperty("--brand-primary", "#E11D48");
        root.style.setProperty("--brand-primary-light", "#FFF1F2");
        root.style.setProperty("--theme-bg", "#FFFFFF");
        root.style.setProperty("--theme-text", "#0F1F35");
        root.style.setProperty("--theme-text-muted", "#64748B");
        root.style.setProperty("--theme-card-bg", "#FFFFFF");
        root.style.setProperty("--theme-card-border", "rgba(226, 232, 240, 0.8)");
        root.style.setProperty("--theme-input-bg", "#F8FAFC");
        root.style.setProperty("--theme-nav-bg", "rgba(255, 255, 255, 0.95)");
        root.style.setProperty("--theme-nav-text", "#0F1F35");
      } else {
        root.style.setProperty("--brand-primary", "#FDA4AF");
        root.style.setProperty("--brand-primary-light", "#2D171E");
        root.style.setProperty("--theme-bg", "#12090C");
        root.style.setProperty("--theme-text", "#FFFFFF");
        root.style.setProperty("--theme-text-muted", "#94A3B8");
        root.style.setProperty("--theme-card-bg", "#1D1216");
        root.style.setProperty("--theme-card-border", "rgba(255, 255, 255, 0.08)");
        root.style.setProperty("--theme-input-bg", "#090406");
        root.style.setProperty("--theme-nav-bg", "rgba(18, 9, 12, 0.95)");
        root.style.setProperty("--theme-nav-text", "#FFFFFF");
      }
    }
    localStorage.setItem("firststep_theme", theme);
    localStorage.setItem("firststep_mode", mode);
  }, [theme, mode]);

  // Fallback single-cv state for legacy users
  const [polishedCV, setPolishedCV] = useState<PolishedCV | null>(null);

   const getUserKey = (userObj: User | null) => {
    return userObj ? `firststep_cvs_${userObj.id}` : "firststep_cvs_anonymous";
  };

  const getAppliedJobsKey = (userObj: User | null) => {
    return userObj ? `firststep_applied_jobs_${userObj.id}` : "firststep_applied_jobs_anonymous";
  };


  // Synchronize dynamic user states and load isolated CV list
  useEffect(() => {
    try {
      // 1. Active User session on initial load
      const savedUser = localStorage.getItem("firststep_active_user");
      let activeUserObj = currentUser;
      if (savedUser && !currentUser) {
        activeUserObj = JSON.parse(savedUser);
        setCurrentUser(activeUserObj);
      }

      // 2. Load applications and CVs locally as temporary/immediate startup placeholder
      const appsKey = getAppliedJobsKey(activeUserObj);
      const savedApps = localStorage.getItem(appsKey);
      if (savedApps) {
        setAppliedJobIds(JSON.parse(savedApps));
      } else if (!activeUserObj) {
        const globalApps = localStorage.getItem("firststep_applied_jobs");
        if (globalApps) {
          setAppliedJobIds(JSON.parse(globalApps));
        } else {
          setAppliedJobIds([]);
        }
      }

      const userKey = getUserKey(activeUserObj);
      const savedCvList = localStorage.getItem(userKey);
      if (savedCvList) {
        const parsedList = JSON.parse(savedCvList);
        setCvList(parsedList);
        if (parsedList.length > 0) {
          setPolishedCV(parsedList[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load initial active user state:", e);
    }
  }, []);


  // Synchronize dynamic user lists with Firebase Firestore on authenticated session
  useEffect(() => {
    if (!currentUser) return;

    // Immediately load from localStorage so data is visible before any async call
    const localCvsKey = getUserKey(currentUser);
    const localJobsKey = getAppliedJobsKey(currentUser);
    try {
      const savedCvsData = localStorage.getItem(localCvsKey);
      if (savedCvsData) {
        const localCvs: PolishedCV[] = JSON.parse(savedCvsData);
        setCvList(localCvs);
        if (localCvs.length > 0) {
          setPolishedCV(localCvs[0]);
        }
      }
      const savedJobsData = localStorage.getItem(localJobsKey);
      if (savedJobsData) {
        setAppliedJobIds(JSON.parse(savedJobsData));
      }
    } catch (localErr) {
      console.warn("Failed to load local data on user change:", localErr);
    }

    let isSubscribed = true;
    async function loadUserData() {
      try {
        // Fetch CVs from PostgreSQL API
        const cvs = await apiGetUserCVs(currentUser.id);
        if (!isSubscribed) return;

        let finalCvs = cvs;

        // If DB returns nothing but localStorage has data, migrate it
        if (cvs.length === 0) {
          const savedCvsData = localStorage.getItem(localCvsKey);
          if (savedCvsData) {
            try {
              const localCvs: PolishedCV[] = JSON.parse(savedCvsData);
              if (localCvs.length > 0) {
                finalCvs = localCvs;
                for (const item of localCvs) {
                  apiSaveUserCV(currentUser.id, item).catch(() => {});
                }
              }
            } catch (parseErr) {
              console.error("Failed to parse local CVs:", parseErr);
            }
          }
        }

        setCvList(finalCvs);
        if (finalCvs.length > 0) {
          setPolishedCV(finalCvs[0]);
          localStorage.setItem("firststep_polished_cv", JSON.stringify(finalCvs[0]));
        } else {
          setPolishedCV(null);
          localStorage.removeItem("firststep_polished_cv");
        }
        localStorage.setItem(getUserKey(currentUser), JSON.stringify(finalCvs));

        // Fetch job applications from PostgreSQL API
        const apps = await apiGetUserApplications(currentUser.id);
        if (!isSubscribed) return;

        let finalJobIds = apps.map((a) => a.jobId);

        if (apps.length === 0) {
          const savedJobsData = localStorage.getItem(localJobsKey);
          if (savedJobsData) {
            try {
              const localJobIds: string[] = JSON.parse(savedJobsData);
              if (localJobIds.length > 0) {
                finalJobIds = localJobIds;
                for (const jId of localJobIds) {
                  apiSaveUserApplication(currentUser.id, {
                    id: `app_${Math.random().toString(36).substring(2, 11)}`,
                    userId: currentUser.id,
                    jobId: jId,
                    cvId: finalCvs.length > 0 ? finalCvs[0].id : "cv_default",
                    appliedAt: new Date().toISOString(),
                    status: "submitted"
                  }).catch(() => {});
                }
              }
            } catch (parseErr) {
              console.error("Failed to parse local jobs:", parseErr);
            }
          }
        }

        setAppliedJobIds(finalJobIds);
        localStorage.setItem(getAppliedJobsKey(currentUser), JSON.stringify(finalJobIds));
      } catch (err) {
        // DB unavailable — localStorage data already loaded above
        console.warn("DB sync skipped, using localStorage data:", err);
      }
    }

    loadUserData();

    return () => {
      isSubscribed = false;
    };
  }, [currentUser]);

  const handleSaveCVList = async (newList: PolishedCV[]) => {
    const oldList = [...cvList];
    setCvList(newList);
    try {
      localStorage.setItem(getUserKey(currentUser), JSON.stringify(newList));
      // Keeping single active cv in sync for legacy elements
      if (newList.length > 0) {
        const currentActiveId = polishedCV?.id;
        const matchingActive = newList.find(c => c.id === currentActiveId);
        const cvToSet = matchingActive || newList[0];
        setPolishedCV(cvToSet);
        localStorage.setItem("firststep_polished_cv", JSON.stringify(cvToSet));
      } else {
        setPolishedCV(null);
        localStorage.removeItem("firststep_polished_cv");
      }
    } catch (e) {
      console.error("Storage save failed:", e);
    }

    // Sync to PostgreSQL
    if (currentUser) {
      try {
        for (const item of newList) {
          const original = oldList.find((o) => o.id === item.id);
          if (!original || JSON.stringify(original) !== JSON.stringify(item)) {
            await apiSaveUserCV(currentUser.id, item);
          }
        }
        for (const orig of oldList) {
          const exists = newList.some((n) => n.id === orig.id);
          if (!exists) {
            await apiDeleteUserCV(currentUser.id, orig.id);
          }
        }
      } catch (err) {
        console.error("DB CV sync failed:", err);
      }
    }
  };

  const handleApplyJob = async (jobId: string, cvId: string) => {
    const updated = [...appliedJobIds, jobId];
    setAppliedJobIds(updated);
    try {
      const appsKey = getAppliedJobsKey(currentUser);
      localStorage.setItem(appsKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to store applied job ID:", e);
    }

    // Save application to PostgreSQL
    if (currentUser) {
      try {
        const newAppId = `app_${Math.random().toString(36).substring(2, 11)}`;
        const applicationRecord: JobApplication = {
          id: newAppId,
          userId: currentUser.id,
          jobId,
          cvId: cvId || polishedCV?.id || "default_cv",
          appliedAt: new Date().toISOString(),
          status: "submitted"
        };
        await apiSaveUserApplication(currentUser.id, applicationRecord);
      } catch (err) {
        console.error("DB job application save failed:", err);
      }
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("firststep_active_user");
    localStorage.removeItem("firststep_polished_cv");
    setCvList([]);
    setPolishedCV(null);
    setAppliedJobIds([]);
    setView("home");
  };

  const renderActiveView = () => {
    switch (view) {
      case "home":
        return <LandingPage onNavigate={setView} />;
      case "builder":
        return (
          <CVBuilder 
            currentUser={currentUser}
            cvList={cvList}
            onSaveCVList={handleSaveCVList}
            activePolishedCV={polishedCV}
            setActivePolishedCV={(cv) => {
              setPolishedCV(cv);
              if (cv) {
                localStorage.setItem("firststep_polished_cv", JSON.stringify(cv));
              } else {
                localStorage.removeItem("firststep_polished_cv");
              }
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        );
      case "jobs":
        return (
          <JobsBoard 
            currentUser={currentUser}
            cvList={cvList}
            onNavigate={setView}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenBuilder={() => setView("builder")}
            polishedCV={polishedCV}
            onApplyJob={handleApplyJob}
            appliedJobIds={appliedJobIds}
            initiallySelectedJobId={initiallySelectedJobId}
            onClearInitiallySelectedJobId={() => setInitiallySelectedJobId(null)}
          />
        );
      case "profile":
        return (
          <ProfilePage
            currentUser={currentUser}
            cvList={cvList}
            activePolishedCV={polishedCV}
            onSaveCVList={handleSaveCVList}
            setActivePolishedCV={setPolishedCV}
            onNavigate={setView}
            appliedJobIds={appliedJobIds}
            onViewJobDetails={(jobId) => {
              setInitiallySelectedJobId(jobId);
              setView("jobs");
            }}
            onApplyJob={handleApplyJob}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenBuilder={() => setView("builder")}
          />
        );
      default:
        return <LandingPage onNavigate={setView} />;
    }
  };

  const getFooterBg = () => {
    switch (theme) {
      case "mascot":
        return "bg-[#1E0836] border-t border-brand-primary/20";
      case "classic":
        return "bg-[#0B1E36] border-t border-brand-primary/20";
      case "emerald":
        return "bg-[#021F1E] border-t border-brand-primary/20";
      case "sunset":
        return "bg-[#2E0812] border-t border-brand-primary/20";
      default:
        return "bg-slate-900 border-t border-slate-800";
    }
  };

  return (
    <div className={`min-h-screen bg-theme-bg text-theme-text flex flex-col justify-between selection:bg-brand-secondary/15 selection:text-brand-primary transition-colors duration-300 ${mode === "dark" ? "mode-dark dark" : "mode-light"}`}>
      
      {/* Dynamic Top Navigation Bar */}
      <Navbar 
        activeView={view} 
        onNavigate={setView} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
        mode={mode}
        onModeChange={setMode}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* Premium minimal Footer */}
      <footer className={`${getFooterBg()} text-slate-400 py-12 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div 
              onClick={() => { setView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity select-none group"
              id="footer-logo"
            >
              <div className="w-9 h-9 rounded-xl bg-transparent flex items-center justify-center p-0.5 shadow-xs group-hover:scale-105 transition-transform duration-300">
                <img
                  src={mascotLogo}
                  alt="FirstStep Logo"
                  className="w-full h-full object-contain rounded-lg bg-transparent"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-base font-extrabold tracking-tight text-white">
                First<span className="text-brand-primary font-bold ml-0.5">Step</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium font-sans">
              &copy; {new Date().getFullYear()} FirstStep. ყველა უფლება დაცულია. შექმნილია საქართველოში სტუდენტებისთვის.
            </p>
            <div className="flex space-x-6 text-xs font-bold text-slate-400">
              <span className="hover:text-brand-secondary transition-colors cursor-pointer" onClick={() => setView("home")}>მთავარი</span>
              <span className="hover:text-brand-secondary transition-colors cursor-pointer" onClick={() => setView("builder")}>CV ბილდერი</span>
              <span className="hover:text-brand-secondary transition-colors cursor-pointer" onClick={() => setView("jobs")}>ვაკანსიები</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Portal Auth modal popup */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
