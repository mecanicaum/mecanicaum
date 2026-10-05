import React from 'react';
import { Video, ExternalLink } from 'lucide-react';

export function extractUrl(text: string): string | null {
  if (!text) return null;
  const match = text.match(/(https?:\/\/[^\s]+)/i);
  return match ? match[0] : null;
}

interface VirtualMeetingLinkProps {
  locationText: string;
  showButton?: boolean;
  className?: string;
}

export const VirtualMeetingLink: React.FC<VirtualMeetingLinkProps> = ({
  locationText,
  showButton = false,
  className = '',
}) => {
  if (!locationText) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = locationText.split(urlRegex);
  const detectedUrl = extractUrl(locationText);

  const isVideoMeeting = detectedUrl && (
    /meet\.google\.com|zoom\.us|teams\.microsoft\.com|webex\.com/i.test(detectedUrl)
  );

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span>
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            const cleanUrl = part.replace(/[.,;)]+$/, '');
            return (
              <a
                key={i}
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/80 px-1.5 py-0.5 rounded transition-colors break-all"
                title="Abrir enlace de reunión virtual en nueva pestaña"
              >
                <Video className="h-3 w-3 shrink-0 text-blue-600" />
                <span>{cleanUrl}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 text-blue-500" />
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>

      {showButton && detectedUrl && (
        <a
          href={detectedUrl.replace(/[.,;)]+$/, '')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          title="Unirse a la sesión virtual convocada"
        >
          <Video className="h-3.5 w-3.5" />
          <span>{isVideoMeeting ? 'Unirse a Videoconferencia' : 'Abrir Enlace Virtual'}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
