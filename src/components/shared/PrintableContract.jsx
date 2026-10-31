import React from 'react';
import { useApp } from '../../context/AppContext';

export default function PrintableContract() {
  const { landlordName, tenantName, contactNumber, contractClauses } = useApp();

  return (
    <div className="hidden print:block print-contract p-8 max-w-3xl mx-auto bg-white text-black font-serif leading-relaxed">
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <p className="text-xs uppercase tracking-widest text-slate-600 font-sans font-semibold">
          Republika ng Pilipinas · Lungsod ng Cagayan de Oro
        </p>
        <h1 className="text-2xl font-black mt-1 font-sans text-slate-900">KASULATAN SA PAG-ABANG</h1>
        <h2 className="text-sm font-bold text-slate-700 tracking-wide font-sans">CONTRACT OF RESIDENTIAL LEASE</h2>
        <p className="text-xs text-slate-500 mt-1">Prepared pursuant to the Civil Code of the Philippines & Rent Control Act</p>
      </div>

      <div className="mb-4 text-xs leading-relaxed">
        <p><strong>ALAMIN NG LAHAT SA PAMAMAGITAN NITO:</strong></p>
        <p className="mt-1">
          Ang Kasulatang ito ay pinagkasunduan at isinagawa ngayong ika-31 ng Oktubre, 2026 sa Lungsod ng Cagayan de Oro, sa pagitan nina:
        </p>
        <p className="mt-2 pl-4">
          <strong>{landlordName}</strong>, nasa wastong gulang, may-ari/tagapamahala ng paupahan, na rito ay kinikilala bilang <strong>NAGPAPAUPA (LESSOR)</strong>;
        </p>
        <p className="mt-1 pl-4">
          - at -
        </p>
        <p className="mt-1 pl-4">
          <strong>{tenantName}</strong>, nasa wastong gulang, Pilipino, na rito ay kinikilala bilang <strong>UMUUPA (LESSEE)</strong>.
        </p>
      </div>

      <div className="space-y-3 text-xs leading-relaxed">
        {contractClauses.map((c) => (
          <div key={c.num} className="pt-1">
            <strong className="block font-sans font-bold text-slate-900">{c.title}</strong>
            <p className="pl-4 mt-0.5 text-slate-800">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-xs text-center">
        <div>
          <div className="border-b border-black w-48 mx-auto mb-1 h-10 flex items-end justify-center font-serif italic text-sm text-[#14532D]">
            {landlordName}
          </div>
          <p className="font-bold font-sans">{landlordName}</p>
          <p className="text-[10px] text-slate-500">NAGPAPAUPA (Lessor)</p>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">Contact: {contactNumber}</p>
        </div>

        <div>
          <div className="border-b border-black w-48 mx-auto mb-1 h-10 flex items-end justify-center font-serif italic text-sm text-[#14532D]">
            ~ {tenantName} ~
          </div>
          <p className="font-bold font-sans">{tenantName}</p>
          <p className="text-[10px] text-slate-500">UMUUPA (Lessee)</p>
          <p className="text-[9px] text-slate-400 font-mono mt-0.5">PhilSys Verified · Digital Signature</p>
        </div>
      </div>

      {/* Acknowledgment Footer */}
      <div className="mt-10 pt-4 border-t border-slate-300 text-[10px] text-slate-500 text-center font-sans">
        <p>Certified generated via Rent in Peace (RIP) Autonomous Lease Platform · Cagayan de Oro City</p>
        <p className="font-mono mt-0.5">Digital Hash: RIP-CDO-2026-882194-OK · Timestamp: 2026-10-31 14:00 PST</p>
      </div>
    </div>
  );
}
