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
  const detectedUrl = extractUrl(locationText);

  if (!detectedUrl) {
    return <span className={className}>{locationText}</span>;
  }

  const cleanUrl = detectedUrl.replace(/[.,;)]+$/, '');
  const isVideoMeeting = /meet\.google\.com|zoom\.us|teams\.microsoft\.com|webex\.com/i.test(cleanUrl);
  const parts = locationText.split(urlRegex);

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          if (showButton) {
            // Single button for joining videoconference - no duplicate link
            return (
              <a
                key={i}
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                title={`Unirse a la sesión virtual: ${cleanUrl}`}
              >
                <Video className="h-3.5 w-3.5 shrink-0" />
                <span>{isVideoMeeting ? 'Unirse a Videoconferencia' : 'Abrir Enlace Virtual'}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
              </a>
            );
          } else {
            // Inline clickable link
            return (
              <a
                key={i}
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/80 px-1.5 py-0.5 rounded transition-colors break-all"
                title="Abrir enlace en nueva pestaña"
              >
                <Video className="h-3 w-3 shrink-0 text-blue-600" />
                <span>{cleanUrl}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0 text-blue-500" />
              </a>
            );
          }
        }
        // Plain text part
        const textSegment = part.trim();
        if (!textSegment) return null;
        return <span key={i} className="text-slate-700 font-medium">{textSegment}</span>;
      })}
    </div>
  );
};
