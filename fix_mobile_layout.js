const fs = require('fs');

function updateLayout() {
  let content = fs.readFileSync('./app/layout.tsx', 'utf8');
  
  content = content.replace(
    /EnterpriseChatWidget\.init\(\{\n\s*widgetKey: "wgt_d14f331341854644be",\n\s*apiUrl: "https:\/\/aichat-backend\.npms\.pro\/api\/v1"\n\s*\}\);/g,
    `EnterpriseChatWidget.init({
              widgetKey: "wgt_d14f331341854644be",
              apiUrl: "https://aichat-backend.npms.pro/api/v1"
            });

            // Adjust chatbot position on mobile to avoid bottom nav bar
            setTimeout(() => {
              const host = document.getElementById("aiaas-widget-host");
              if (host && host.shadowRoot) {
                const style = document.createElement("style");
                style.textContent = \`
                  @media (max-width: 768px) {
                    .aiaas-launcher { bottom: 85px !important; }
                    .aiaas-window { bottom: 85px !important; }
                  }
                \`;
                host.shadowRoot.appendChild(style);
              }
            }, 2000);`
  );

  fs.writeFileSync('./app/layout.tsx', content);
}

function updateFloatingContact() {
  let content = fs.readFileSync('./components/FloatingContact.tsx', 'utf8');
  // Change bottom position
  content = content.replace(
    /className="fixed bottom-28 md:bottom-24 right-4 md:right-8 z-50 flex flex-col gap-4"/g,
    'className="fixed bottom-[160px] md:bottom-28 right-4 md:right-8 z-50 flex flex-col gap-4"'
  );
  fs.writeFileSync('./components/FloatingContact.tsx', content);
}

updateLayout();
updateFloatingContact();
