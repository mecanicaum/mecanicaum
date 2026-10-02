import QRCode from 'qrcode';
import { Meeting, Motion, Commitment } from '../types';

/**
 * Computes standard SHA-256 in hex format using Web Crypto API or browser fallback
 */
export async function computeSha256Hex(text: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('[CryptoVerification] WebCrypto error, using fallback:', err);
  }

  // Fallback pure JS SHA-256 if crypto.subtle is unavailable
  return fallbackSha256(text);
}

/**
 * Generates the canonical string representation of an Acta for tamper-evident validation
 */
export function generateActaCanonicalPayload(
  meeting: Meeting,
  notes: string = '',
  motions: Motion[] = [],
  commitments: Commitment[] = []
): string {
  const meetingMotions = motions.filter((m) => m.meetingId === meeting.id);
  const meetingCommitments = commitments.filter((c) => c.meetingId === meeting.id);

  return JSON.stringify({
    institution: 'Institución Universitaria Mayor de Cartagena',
    program: 'Departamento de Ingeniería Mecánica',
    body: 'Comité Curricular',
    meetingId: meeting.id,
    meetingCode: meeting.code,
    title: meeting.title,
    sessionDate: meeting.date,
    sessionTime: meeting.startTime,
    president: meeting.attendees.find((a) => a.role === 'presidente')?.userName || 'Presidencia del Comité',
    attendees: meeting.attendees.map((a) => ({
      userId: a.userId,
      userName: a.userName,
      present: a.present,
      role: a.role,
    })),
    agenda: meeting.agendaItems.map((ag) => ({
      order: ag.order,
      title: ag.title,
      deliberations: ag.deliberations || '',
      agreements: ag.agreements || '',
    })),
    motions: meetingMotions.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      result: m.result,
    })),
    commitments: meetingCommitments.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      responsibleName: c.responsibleName,
      dueDate: c.dueDate,
    })),
    generalObservations: notes || meeting.generalObservations || '',
  });
}

/**
 * Returns the public verification URL for an Acta
 */
export function getActaVerificationUrl(meetingCode: string): string {
  if (typeof window === 'undefined') return `https://sig-curriculo.umayor.edu.co/?verify=${meetingCode}`;
  
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?verify=${encodeURIComponent(meetingCode)}`;
}

/**
 * Generates a high-quality, scannable QR Code Data URL
 */
export async function generateQrCodeDataUrl(urlOrText: string): Promise<string> {
  try {
    return await QRCode.toDataURL(urlOrText, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('[CryptoVerification] Failed to generate QR:', err);
    return '';
  }
}

/**
 * Lightweight pure JS SHA-256 implementation as a bulletproof offline fallback
 */
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const maxWord = Math.pow(2, 32);
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: [number, number, number, number, number, number, number, number] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let str = ascii;
  str += '\x80';
  while ((str.length % 64) !== 56) str += '\x00';
  for (let i = 0; i < str.length; i++) {
    const j = i & 3;
    const wordIndex = i >> 2;
    words[wordIndex] = (words[wordIndex] || 0) | (str.charCodeAt(i) << ((3 - j) * 8));
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = [...hash];

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15] || 0;
      const w2 = w[i - 2] || 0;

      const a = hash[0];
      const e = hash[4];
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & hash[5]) ^ (~e & hash[6]);
      const wVal = i < 16
        ? (w[i] || 0)
        : ((w[i - 16] || 0) +
            (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
            (w[i - 7] || 0) +
            (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0;
      w[i] = wVal;

      const temp1 = (hash[7] + s1 + ch + k[i] + wVal) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash = [
        (temp1 + temp2) | 0,
        hash[0],
        hash[1],
        hash[2],
        (hash[3] + temp1) | 0,
        hash[4],
        hash[5],
        hash[6]
      ];
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}
