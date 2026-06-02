import { PolishedCV, Job } from "./types";
// @ts-ignore
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

// Perfect, high-fidelity OKLCH to RGB conversion algorithm
function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  const hRad = (h * Math.PI) / 180;
  
  const L = l;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);
  
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541128 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  const rL = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gL = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bL = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  const toSRGB = (colorVal: number) => {
    return colorVal <= 0.0031308 ? 12.92 * colorVal : 1.055 * Math.pow(colorVal, 1 / 2.4) - 0.055;
  };
  
  const r = Math.round(Math.max(0, Math.min(1, toSRGB(rL))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, toSRGB(gL))) * 255);
  const b = Math.round(Math.max(0, Math.min(1, toSRGB(bL))) * 255);
  
  if (a !== 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

// Replaces oklch expressions in stylesheet strings with fallback/rgb alternatives
function convertOklchInString(text: string): string {
  return text.replace(/oklch\(([^)]+)\)/gi, (match, p1) => {
    try {
      const halves = p1.split("/");
      const colorPart = halves[0].trim();
      const alphaPart = halves[1] ? halves[1].trim() : null;
      
      const parts = colorPart.split(/\s+/);
      if (parts.length < 3) return "rgb(120, 120, 120)"; 
      
      let l = parseFloat(parts[0]);
      let c = parseFloat(parts[1]);
      let h = parseFloat(parts[2]);
      
      if (parts[0].includes("%")) {
        l = parseFloat(parts[0]) / 100;
      }
      if (parts[1].includes("%")) {
        c = (parseFloat(parts[1]) / 100) * 0.4; 
      }
      
      let a = 1;
      if (alphaPart) {
        if (alphaPart.includes("%")) {
          a = parseFloat(alphaPart) / 100;
        } else {
          a = parseFloat(alphaPart);
        }
      }
      
      if (isNaN(l) || isNaN(c) || isNaN(h)) return "rgb(120, 120, 120)";
      
      return oklchToRgb(l, c, h, a);
    } catch (e) {
      return "rgb(120, 120, 120)";
    }
  });
}

// Temporary style patching manager to prevent html2canvas oklch crash
async function patchDocumentStylesheets(): Promise<() => void> {
  const stylesToRestore: Array<{ element: HTMLStyleElement; originalText: string }> = [];
  const linksToRestore: Array<{ element: HTMLLinkElement; tempStyle: HTMLStyleElement }> = [];
  
  // 1. Process inline <style> tags
  const styleElements = Array.from(document.querySelectorAll("style"));
  for (const style of styleElements) {
    const text = style.textContent || "";
    if (text.includes("oklch")) {
      stylesToRestore.push({ element: style, originalText: text });
      style.textContent = convertOklchInString(text);
    }
  }
  
  // 2. Process external same-origin <link> tags
  const linkElements = Array.from(document.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
  for (const link of linkElements) {
    try {
      const href = link.href;
      if (href && href.startsWith(window.location.origin)) {
        const response = await fetch(href);
        if (response.ok) {
          const rawCss = await response.text();
          if (rawCss.includes("oklch")) {
            // Disable original link tag
            link.disabled = true;
            
            // Create a temporary patched style element
            const tempStyle = document.createElement("style");
            tempStyle.type = "text/css";
            tempStyle.textContent = convertOklchInString(rawCss);
            document.head.appendChild(tempStyle);
            
            linksToRestore.push({ element: link, tempStyle });
          }
        }
      }
    } catch (err) {
      console.warn("Could not patch link stylesheet due to CORS or network error:", link.href, err);
    }
  }
  
  // Return the restore function
  return () => {
    // Restore style element contents
    for (const { element, originalText } of stylesToRestore) {
      element.textContent = originalText;
    }
    // Restore link elements and remove temp style tags
    for (const { element, tempStyle } of linksToRestore) {
      element.disabled = false;
      if (tempStyle.parentNode) {
        tempStyle.parentNode.removeChild(tempStyle);
      }
    }
  };
}

// Template Styles Pairing
export function getTemplateContainerStyles(template: "classic" | "tech" | "editorial" | "modern"): string {
  switch (template) {
    case "tech":
      return "font-mono text-slate-800 tracking-tight bg-slate-50 border-t-4 border-slate-700 p-8 space-y-5 rounded-md";
    case "editorial":
      return "font-serif text-amber-950 tracking-wide bg-[#FAF7F2] p-8 space-y-6 rounded-md shadow-inner";
    case "modern":
      return "font-sans text-slate-800 bg-gradient-to-br from-slate-50 to-[#EBF5FB]/30 p-8 space-y-6 border-l-4 border-brand-secondary rounded-2xl shadow-xs";
    default: // classic
      return "font-sans text-slate-900 bg-white p-8 space-y-5 border-l-4 border-brand-primary rounded-md";
  }
}

export function getTemplateHeaderColor(template: "classic" | "tech" | "editorial" | "modern"): string {
  switch (template) {
    case "tech": return "text-slate-800 font-extrabold border-b border-dashed border-slate-300 pb-3 text-2xl";
    case "editorial": return "text-[#3b1f11] font-normal font-serif text-3xl pb-2 border-b border-amber-800/20";
    case "modern": return "text-brand-primary font-black text-2xl tracking-tighter pb-2 border-b-2 border-brand-secondary/20 flex items-center justify-between";
    default: return "text-brand-primary font-black tracking-tight pb-3 border-b-2 border-brand-primary/10";
  }
}

export function getTemplateLabelStyles(template: "classic" | "tech" | "editorial" | "modern"): string {
  switch (template) {
    case "tech": return "text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2";
    case "editorial": return "text-sm font-semibold font-serif text-amber-900 border-l border-amber-800 px-2 block mb-2";
    case "modern": return "text-xs font-black text-brand-secondary uppercase tracking-widest pl-2.5 border-l-2 border-brand-secondary block mb-2";
    default: return "text-xs font-extrabold text-brand-secondary uppercase tracking-wider block mb-2";
  }
}

function getSkillBadgeInlineStyle(template: string, brandPrimary: string, brandPrimaryLight: string, brandSecondary: string) {
  switch (template) {
    case "tech":
      return `display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: bold; color: #334155; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-family: ui-monospace, monospace; margin: 3px;`;
    case "editorial":
      return `display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 500; font-family: Georgia, serif; color: #78350f; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; margin: 3px;`;
    default: // classic, modern
      return `display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 800; color: ${brandPrimary}; background-color: ${brandPrimaryLight}; border: 1px solid ${brandSecondary}22; border-radius: 8px; font-family: Inter, system-ui, sans-serif; margin: 3px;`;
  }
}

function buildCvHtmlContent(cv: PolishedCV, brandPrimary: string, brandPrimaryLight: string, brandSecondary: string): string {
  const containerClass = getTemplateContainerStyles(cv.template || "classic");
  const headerClass = getTemplateHeaderColor(cv.template || "classic");
  const labelClass = getTemplateLabelStyles(cv.template || "classic");
  
  return `
    <div class="${containerClass} text-left text-slate-900" style="width: 100%; box-shadow: none; display: flex; flex-direction: column; gap: 20px;">
      <!-- Header elements -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-slate-200" style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 16px; width: 100%; border-bottom: 1px solid #cbd5e1; padding-bottom: 16px;">
        <div class="space-y-2" style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <h2 class="${headerClass}" style="margin: 0; font-size: 24px;">${cv.name || "სახელი და გვარი"}</h2>
          <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500 font-mono" style="display: flex; flex-wrap: wrap; gap: 16px;">
            ${cv.email ? `<span>✉️ ${cv.email}</span>` : ""}
            ${cv.phone ? `<span>📞 ${cv.phone}</span>` : ""}
          </div>
        </div>

        <!-- Photo block if uploaded -->
        ${cv.photoUrl ? `
          <div class="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs shrink-0 self-start" style="width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; flex-shrink: 0;">
            <img src="${cv.photoUrl}" alt="CV avatar" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : ""}
      </div>

      <!-- Summary card section -->
      ${cv.summary ? `
        <div class="space-y-1" style="display: flex; flex-direction: column; gap: 6px;">
          <h3 class="${labelClass}">პროფესიული პროფილი</h3>
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal p-1" style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-line;">
            ${cv.summary}
          </p>
        </div>
      ` : ""}

      <!-- Education -->
      ${cv.education ? `
        <div class="space-y-1.5" style="display: flex; flex-direction: column; gap: 6px;">
          <h3 class="${labelClass}">განათლება</h3>
          <div class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line ps-1" style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-line;">
            ${cv.education}
          </div>
        </div>
      ` : ""}

      <!-- Projects -->
      ${cv.projects ? `
        <div class="space-y-1.5" style="display: flex; flex-direction: column; gap: 6px;">
          <h3 class="${labelClass}">სასწავლო პროექტები & პრაქტიკა</h3>
          <div class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line ps-1 space-y-1.5" style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-line;">
            ${cv.projects}
          </div>
        </div>
      ` : ""}

      <!-- Activities -->
      ${cv.activities ? `
        <div class="space-y-1.5" style="display: flex; flex-direction: column; gap: 6px;">
          <h3 class="${labelClass}">სტუდენტური აქტივობები</h3>
          <div class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line ps-1" style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-line;">
            ${cv.activities}
          </div>
        </div>
      ` : ""}

      <!-- Skills -->
      ${cv.skills && cv.skills.length > 0 ? `
        <div class="space-y-2 pt-1" style="display: flex; flex-direction: column; gap: 6px; padding-top: 4px;">
          <h3 class="${labelClass}">ტექნიკური უნარები</h3>
          <div class="flex flex-wrap gap-1.5" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${cv.skills.map(skill => `
              <span class="px-2.5 py-1 text-xs font-bold text-brand-primary bg-brand-primary-light border border-brand-secondary/10 rounded-lg shadow-2xs font-mono" style="${getSkillBadgeInlineStyle(cv.template || "classic", brandPrimary, brandPrimaryLight, brandSecondary)}">${skill}</span>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

export async function exportCvAsPdfFile(cv: PolishedCV) {
  const node = document.getElementById("printable-cv-container");
  if (!node) {
    console.error("CV preview element not found");
    return;
  }

  // Find the scrollable ancestor that clips the CV preview and temporarily expand it
  const scrollParent = node.closest(".overflow-y-auto") as HTMLElement | null;
  const savedMaxHeight = scrollParent?.style.maxHeight ?? "";
  const savedOverflow = scrollParent?.style.overflow ?? "";
  const savedOverflowY = scrollParent?.style.overflowY ?? "";

  let restoreStylesheets: (() => void) | null = null;

  try {
    // 1. Expand scroll container so full CV is rendered in DOM (not clipped)
    if (scrollParent) {
      scrollParent.style.maxHeight = "none";
      scrollParent.style.overflow = "visible";
      scrollParent.style.overflowY = "visible";
    }

    // 2. Remove oklch colour values that html2canvas can't handle
    restoreStylesheets = await patchDocumentStylesheets();

    // 3. Screenshot the live element exactly as rendered — no cloning, no rebuilding
    const canvas = await html2canvas(node, {
      scale: 3,          // 3× for sharp print output
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    // 4. Create a PDF whose page size exactly matches the screenshot — like saving as image
    const imgData = canvas.toDataURL("image/png");

    // Use pixel units so the page dimensions = canvas dimensions exactly (no margins, no A4)
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
      hotfixes: ["px_scaling"],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${(cv.name || "CV").replace(/\s+/g, "_")}_CV.pdf`);
  } catch (err) {
    console.error("PDF export failed:", err);
  } finally {
    // Restore scroll container to original state
    if (scrollParent) {
      scrollParent.style.maxHeight = savedMaxHeight;
      scrollParent.style.overflow = savedOverflow;
      scrollParent.style.overflowY = savedOverflowY;
    }
    if (restoreStylesheets) restoreStylesheets();
  }
}

export const exportCvAsHtmlFile = exportCvAsPdfFile;

export function calculateJobMatchPercent(cv: PolishedCV, job: Job): { percent: number; matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];
  
  const cvSkills = cv.skills || [];
  const cvText = [
    cv.summary || "",
    cv.education || "",
    cv.projects || "",
    cv.activities || "",
    ...cvSkills
  ].join(" ").toLowerCase();

  job.skillTags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    
    // Check if tag is in skills array
    const hasTagInSkills = cvSkills.some(s => {
      const sLower = s.toLowerCase();
      return sLower.includes(tagLower) || tagLower.includes(sLower);
    });

    // Or check if mentioned in the rest of the text
    const hasTagInText = cvText.includes(tagLower);

    if (hasTagInSkills || hasTagInText) {
      matched.push(tag);
    } else {
      missing.push(tag);
    }
  });

  const ratio = job.skillTags.length > 0 ? (matched.length / job.skillTags.length) : 0;
  // Dynamic scale from 65% to 98% based on actual overlaps
  const percent = Math.min(Math.round(65 + (ratio * 33)), 98);
  
  return {
    percent,
    matched,
    missing
  };
}

