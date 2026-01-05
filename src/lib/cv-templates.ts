export interface CVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  github_url: string | null;
  linkedin_url: string | null;
  experiences: {
    title: string;
    company: string;
    period: string;
    description: string[];
  }[];
  skills: {
    name: string;
    level: string;
    category: string;
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  generate: (data: CVData) => string;
}

const modernTemplate = (data: CVData): string => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #333; padding: 30px; background: #fff;">
  <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #6366f1;">
    <h1 style="font-size: 28px; font-weight: 700; color: #1e1b4b; margin: 0 0 5px 0;">${data.name}</h1>
    <p style="font-size: 16px; color: #6366f1; font-weight: 500; margin: 0 0 12px 0;">${data.title}</p>
    <div style="font-size: 12px; color: #666;">
      <span style="margin-right: 15px;">📧 ${data.email}</span>
      <span style="margin-right: 15px;">📱 ${data.phone}</span>
      <span>📍 ${data.location}</span>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
    <p style="color: #4b5563; text-align: justify; font-size: 13px; margin: 0;">${data.summary}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Experience</h2>
    ${data.experiences.map((exp) => `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
          <div>
            <div style="font-weight: 600; color: #1e1b4b; font-size: 14px;">${exp.title}</div>
            <div style="color: #6366f1; font-size: 13px;">${exp.company}</div>
          </div>
          <div style="color: #9ca3af; font-size: 12px; font-style: italic;">${exp.period}</div>
        </div>
        <ul style="padding-left: 18px; margin: 5px 0 0 0;">
          ${exp.description.map((desc) => `<li style="color: #4b5563; margin-bottom: 3px; font-size: 12px;">${desc}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Skills</h2>
    <div style="display: flex; gap: 30px;">
      <div style="flex: 1;">
        <h4 style="font-weight: 600; color: #1e1b4b; margin-bottom: 6px; font-size: 13px;">Languages & Frameworks</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.skills.filter(s => s.category === 'languages').map((s) => `<li style="color: #4b5563; font-size: 12px; margin-bottom: 3px;">• ${s.name} (${s.level})</li>`).join("")}
        </ul>
      </div>
      <div style="flex: 1;">
        <h4 style="font-weight: 600; color: #1e1b4b; margin-bottom: 6px; font-size: 13px;">Databases & Tools</h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${data.skills.filter(s => s.category === 'databases').map((s) => `<li style="color: #4b5563; font-size: 12px; margin-bottom: 3px;">• ${s.name} (${s.level})</li>`).join("")}
        </ul>
      </div>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
    ${data.education.map((edu) => `
      <div style="margin-bottom: 10px;">
        <div style="font-weight: 600; color: #1e1b4b; font-size: 13px;">${edu.degree}</div>
        <div style="color: #6366f1; font-size: 12px;">${edu.institution}</div>
        <div style="color: #9ca3af; font-size: 11px;">${edu.period}</div>
      </div>
    `).join("")}
  </div>

  <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px;">
    ${data.github_url ? `<a href="${data.github_url}" style="color: #6366f1; text-decoration: none; margin-right: 20px;">GitHub</a>` : ""}
    ${data.linkedin_url ? `<a href="${data.linkedin_url}" style="color: #6366f1; text-decoration: none;">LinkedIn</a>` : ""}
  </div>
</div>
`;

const classicTemplate = (data: CVData): string => `
<div style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; color: #000; padding: 40px; background: #fff;">
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px;">
    <h1 style="font-size: 32px; font-weight: bold; color: #000; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 3px;">${data.name}</h1>
    <p style="font-size: 16px; color: #444; margin: 0 0 15px 0;">${data.title}</p>
    <div style="font-size: 13px; color: #333;">
      ${data.email} | ${data.phone} | ${data.location}
    </div>
  </div>

  <div style="margin-bottom: 25px;">
    <h2 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #999; padding-bottom: 5px;">Profile</h2>
    <p style="color: #333; text-align: justify; font-size: 13px; margin: 0;">${data.summary}</p>
  </div>

  <div style="margin-bottom: 25px;">
    <h2 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #999; padding-bottom: 5px;">Professional Experience</h2>
    ${data.experiences.map((exp) => `
      <div style="margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <div style="font-weight: bold; color: #000; font-size: 14px;">${exp.title}</div>
          <div style="color: #666; font-size: 12px; font-style: italic;">${exp.period}</div>
        </div>
        <div style="color: #444; font-size: 13px; font-style: italic; margin-bottom: 5px;">${exp.company}</div>
        <ul style="padding-left: 20px; margin: 5px 0 0 0;">
          ${exp.description.map((desc) => `<li style="color: #333; margin-bottom: 4px; font-size: 12px;">${desc}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <div style="margin-bottom: 25px;">
    <h2 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #999; padding-bottom: 5px;">Technical Skills</h2>
    <div style="font-size: 12px; color: #333;">
      <p style="margin: 0 0 8px 0;"><strong>Languages & Frameworks:</strong> ${data.skills.filter(s => s.category === 'languages').map(s => s.name).join(", ")}</p>
      <p style="margin: 0;"><strong>Databases & Tools:</strong> ${data.skills.filter(s => s.category === 'databases').map(s => s.name).join(", ")}</p>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 14px; font-weight: bold; color: #000; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #999; padding-bottom: 5px;">Education</h2>
    ${data.education.map((edu) => `
      <div style="margin-bottom: 10px; display: flex; justify-content: space-between;">
        <div>
          <div style="font-weight: bold; color: #000; font-size: 13px;">${edu.degree}</div>
          <div style="color: #444; font-size: 12px;">${edu.institution}</div>
        </div>
        <div style="color: #666; font-size: 12px;">${edu.period}</div>
      </div>
    `).join("")}
  </div>
</div>
`;

const minimalTemplate = (data: CVData): string => `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #222; padding: 35px; background: #fff;">
  <div style="margin-bottom: 30px;">
    <h1 style="font-size: 36px; font-weight: 300; color: #111; margin: 0 0 5px 0;">${data.name}</h1>
    <p style="font-size: 14px; color: #666; margin: 0 0 10px 0; font-weight: 400;">${data.title}</p>
    <div style="font-size: 12px; color: #888;">
      ${data.email} • ${data.phone} • ${data.location}
    </div>
  </div>

  <div style="margin-bottom: 25px;">
    <p style="color: #444; font-size: 13px; margin: 0; line-height: 1.8;">${data.summary}</p>
  </div>

  <div style="margin-bottom: 25px;">
    <h2 style="font-size: 11px; font-weight: 600; color: #999; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Experience</h2>
    ${data.experiences.map((exp) => `
      <div style="margin-bottom: 18px; padding-left: 15px; border-left: 2px solid #eee;">
        <div style="font-weight: 500; color: #111; font-size: 14px;">${exp.title}</div>
        <div style="color: #666; font-size: 12px; margin-bottom: 5px;">${exp.company} — ${exp.period}</div>
        <ul style="padding-left: 15px; margin: 5px 0 0 0; list-style-type: disc;">
          ${exp.description.map((desc) => `<li style="color: #555; margin-bottom: 3px; font-size: 12px;">${desc}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <div style="margin-bottom: 25px;">
    <h2 style="font-size: 11px; font-weight: 600; color: #999; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Skills</h2>
    <div style="font-size: 12px; color: #444;">
      ${data.skills.map(s => s.name).join(" • ")}
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 11px; font-weight: 600; color: #999; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">Education</h2>
    ${data.education.map((edu) => `
      <div style="margin-bottom: 10px;">
        <div style="font-weight: 500; color: #111; font-size: 13px;">${edu.degree}</div>
        <div style="color: #666; font-size: 12px;">${edu.institution} — ${edu.period}</div>
      </div>
    `).join("")}
  </div>

  <div style="font-size: 11px; color: #888; padding-top: 15px; border-top: 1px solid #eee;">
    ${data.github_url ? `GitHub: ${data.github_url}` : ""} ${data.github_url && data.linkedin_url ? " • " : ""} ${data.linkedin_url ? `LinkedIn: ${data.linkedin_url}` : ""}
  </div>
</div>
`;

const creativeTemplate = (data: CVData): string => `
<div style="font-family: 'Segoe UI', sans-serif; line-height: 1.5; color: #333; padding: 0; background: #fff;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 35px; text-align: center;">
    <h1 style="font-size: 30px; font-weight: 700; margin: 0 0 8px 0;">${data.name}</h1>
    <p style="font-size: 16px; opacity: 0.9; margin: 0 0 15px 0;">${data.title}</p>
    <div style="font-size: 12px; opacity: 0.85;">
      <span style="margin-right: 15px;">✉️ ${data.email}</span>
      <span style="margin-right: 15px;">📞 ${data.phone}</span>
      <span>📍 ${data.location}</span>
    </div>
  </div>

  <div style="padding: 30px;">
    <div style="margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 10px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #667eea; margin-bottom: 10px; text-transform: uppercase;">About Me</h2>
      <p style="color: #555; font-size: 13px; margin: 0;">${data.summary}</p>
    </div>

    <div style="margin-bottom: 25px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #667eea; margin-bottom: 15px; text-transform: uppercase;">💼 Experience</h2>
      ${data.experiences.map((exp) => `
        <div style="margin-bottom: 18px; padding: 15px; background: #fafafa; border-left: 4px solid #667eea; border-radius: 0 8px 8px 0;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 5px;">
            <div style="font-weight: 600; color: #333; font-size: 14px;">${exp.title}</div>
            <div style="color: #888; font-size: 11px; background: #eee; padding: 2px 8px; border-radius: 10px;">${exp.period}</div>
          </div>
          <div style="color: #667eea; font-size: 13px; margin: 3px 0 8px 0;">${exp.company}</div>
          <ul style="padding-left: 18px; margin: 0;">
            ${exp.description.map((desc) => `<li style="color: #555; margin-bottom: 3px; font-size: 12px;">${desc}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </div>

    <div style="display: flex; gap: 20px; margin-bottom: 25px;">
      <div style="flex: 1;">
        <h2 style="font-size: 14px; font-weight: 700; color: #667eea; margin-bottom: 12px; text-transform: uppercase;">🛠️ Skills</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${data.skills.map((s) => `<span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 12px; border-radius: 15px; font-size: 11px;">${s.name}</span>`).join("")}
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #667eea; margin-bottom: 12px; text-transform: uppercase;">🎓 Education</h2>
      ${data.education.map((edu) => `
        <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
          <div style="font-weight: 600; color: #333; font-size: 13px;">${edu.degree}</div>
          <div style="color: #666; font-size: 12px;">${edu.institution} • ${edu.period}</div>
        </div>
      `).join("")}
    </div>
  </div>
</div>
`;

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional with accent colors",
    preview: "🎨",
    generate: modernTemplate,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and formal design",
    preview: "📜",
    generate: classicTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant layout",
    preview: "✨",
    generate: minimalTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold and colorful with gradients",
    preview: "🚀",
    generate: creativeTemplate,
  },
];
