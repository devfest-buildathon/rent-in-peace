import React from 'react';
import { useApp } from '../../context/AppContext';

export default function PrintableContract() {
  const { 
    landlordName, 
    tenantName, 
    contactNumber, 
    roomNumber, 
    propertyAddress, 
    propertyType,
    monthlyRent,
    deposit,
    advanceRent,
    leaseDuration,
    contractClauses,
    signatureData,
    landlordSigningMode,
    landlordSignature,
    signingMode,
    landlordProfile
  } = useApp();

  const lessor = (landlordName || 'NAGPAPAUPA (LESSOR)').trim();
  const lessee = (tenantName || 'UMUUPA (LESSEE)').trim();
  const phone = contactNumber ? contactNumber.trim() : '';
  const unit = roomNumber || 'Paupahan / Room';
  const address = propertyAddress || (landlordProfile?.city ? `${landlordProfile?.propertyName || ''}, ${landlordProfile.city}` : 'Pilipinas');
  const pType = propertyType || 'Residential Boarding House / Apartment';
  const rentFormatted = monthlyRent ? `₱${Number(monthlyRent).toLocaleString()}` : '₱3,500';
  const depFormatted = deposit ? `₱${Number(deposit).toLocaleString()}` : '₱3,500';
  const advFormatted = advanceRent ? `₱${Number(advanceRent).toLocaleString()}` : '₱3,500';
  const duration = leaseDuration || '6 na buwan (6 months)';

  const now = new Date();
  const dateFormatted = `${now.getDate()} ng ${now.toLocaleDateString('fil-PH', { month: 'long' })}, ${now.getFullYear()}`;

  const clauses = contractClauses || [];
  const total = clauses.length;

  // Adaptive typography and geometry so it dynamically expands to fill the entire A4 page
  // without leaving any empty white gaps, and scales down if extra clauses are added.
  let scale;

  if (total <= 6) {
    // 1-6 clauses: Generous, large layout to completely fill A4
    scale = {
      isTwoCol: false,
      caption: 'text-[8pt] tracking-widest',
      title: 'text-[14pt] font-black',
      subTitle: 'text-[9.5pt] font-bold',
      citation: 'text-[7.5pt] italic',
      preamble: 'text-[8.5pt] leading-[13pt] mb-2',
      tableHead: 'text-[7.5pt] font-bold py-0.5',
      tableMain: 'text-[10pt] font-bold mt-0.5',
      tableSub: 'text-[7pt] italic',
      tablePad: 'p-2',
      tableMargin: 'mb-3',
      clauseTitle: 'text-[8.8pt] font-bold',
      clauseBody: 'text-[8.5pt] leading-[12.5pt]',
      clauseSpacing: 'space-y-2 mb-3',
      sigSectionMargin: 'pt-2 mb-2',
      sigPrompt: 'text-[8pt] font-bold mb-2',
      sigHeight: 'h-11',
      sigName: 'text-[9.5pt] font-bold',
      sigSub: 'text-[7.5pt]',
      witnessHeight: 'h-5',
      witnessText: 'text-[7pt]',
      witnessMargin: 'pt-1.5 mt-2',
      juratMargin: 'pt-1.5 mt-2',
      juratText: 'text-[7pt] leading-[9.5pt]',
      footerMargin: 'pt-1.5 mt-auto',
      footerText: 'text-[7pt]',
    };
  } else if (total <= 8) {
    // 7-8 clauses (Standard default): Generous single-column that fills 100% of A4
    scale = {
      isTwoCol: false,
      caption: 'text-[7.5pt] tracking-widest',
      title: 'text-[13pt] font-black',
      subTitle: 'text-[9pt] font-bold',
      citation: 'text-[7pt] italic',
      preamble: 'text-[8pt] leading-[11.5pt] mb-1.5',
      tableHead: 'text-[7pt] font-bold py-0.5',
      tableMain: 'text-[9.5pt] font-bold mt-0.5',
      tableSub: 'text-[6.5pt] italic',
      tablePad: 'p-1.5',
      tableMargin: 'mb-2',
      clauseTitle: 'text-[8.2pt] font-bold',
      clauseBody: 'text-[7.8pt] leading-[11pt]',
      clauseSpacing: 'space-y-1.5 mb-2',
      sigSectionMargin: 'pt-1.5 mb-1.5',
      sigPrompt: 'text-[7.5pt] font-bold mb-1.5',
      sigHeight: 'h-9',
      sigName: 'text-[9pt] font-bold',
      sigSub: 'text-[7pt]',
      witnessHeight: 'h-4',
      witnessText: 'text-[6.8pt]',
      witnessMargin: 'pt-1 mt-1.5',
      juratMargin: 'pt-1 mt-1.5',
      juratText: 'text-[6.8pt] leading-[8.8pt]',
      footerMargin: 'pt-1 mt-auto',
      footerText: 'text-[6.8pt]',
    };
  } else if (total <= 10) {
    // 9-10 clauses: Compact single column to prevent 2nd page spillover
    scale = {
      isTwoCol: false,
      caption: 'text-[7pt] tracking-widest',
      title: 'text-[12pt] font-black',
      subTitle: 'text-[8.5pt] font-bold',
      citation: 'text-[6.5pt] italic',
      preamble: 'text-[7.5pt] leading-[10.5pt] mb-1',
      tableHead: 'text-[6.5pt] font-bold',
      tableMain: 'text-[8.5pt] font-bold mt-0.5',
      tableSub: 'text-[6pt] italic',
      tablePad: 'p-1',
      tableMargin: 'mb-1.5',
      clauseTitle: 'text-[7.5pt] font-bold',
      clauseBody: 'text-[7.2pt] leading-[9.8pt]',
      clauseSpacing: 'space-y-1 mb-1.5',
      sigSectionMargin: 'pt-1 mb-1',
      sigPrompt: 'text-[7pt] font-bold mb-1',
      sigHeight: 'h-7',
      sigName: 'text-[8.5pt] font-bold',
      sigSub: 'text-[6.5pt]',
      witnessHeight: 'h-3.5',
      witnessText: 'text-[6.5pt]',
      witnessMargin: 'pt-1 mt-1',
      juratMargin: 'pt-1 mt-1',
      juratText: 'text-[6.5pt] leading-[8.2pt]',
      footerMargin: 'pt-1 mt-auto',
      footerText: 'text-[6.5pt]',
    };
  } else if (total <= 12) {
    // 11-12 clauses: Extra-compact single column
    scale = {
      isTwoCol: false,
      caption: 'text-[6.8pt] tracking-widest',
      title: 'text-[11pt] font-black',
      subTitle: 'text-[8pt] font-bold',
      citation: 'text-[6pt] italic',
      preamble: 'text-[7pt] leading-[9.5pt] mb-1',
      tableHead: 'text-[6pt] font-bold',
      tableMain: 'text-[8pt] font-bold',
      tableSub: 'text-[5.5pt] italic',
      tablePad: 'p-1',
      tableMargin: 'mb-1',
      clauseTitle: 'text-[7.2pt] font-bold',
      clauseBody: 'text-[6.8pt] leading-[8.8pt]',
      clauseSpacing: 'space-y-0.5 mb-1',
      sigSectionMargin: 'pt-0.5 mb-0.5',
      sigPrompt: 'text-[6.5pt] font-bold mb-0.5',
      sigHeight: 'h-6',
      sigName: 'text-[8pt] font-bold',
      sigSub: 'text-[6pt]',
      witnessHeight: 'h-3',
      witnessText: 'text-[6pt]',
      witnessMargin: 'pt-0.5 mt-0.5',
      juratMargin: 'pt-0.5 mt-0.5',
      juratText: 'text-[6pt] leading-[7.8pt]',
      footerMargin: 'pt-0.5 mt-auto',
      footerText: 'text-[6pt]',
    };
  } else {
    // 13+ clauses: Switch to 2 balanced columns so it never spills over to page 2
    scale = {
      isTwoCol: true,
      caption: 'text-[7pt] tracking-widest',
      title: 'text-[11.5pt] font-black',
      subTitle: 'text-[8.5pt] font-bold',
      citation: 'text-[6pt] italic',
      preamble: 'text-[7.2pt] leading-[10pt] mb-1',
      tableHead: 'text-[6.5pt] font-bold',
      tableMain: 'text-[8.5pt] font-bold mt-0.5',
      tableSub: 'text-[6pt] italic',
      tablePad: 'p-1',
      tableMargin: 'mb-1.5',
      clauseTitle: 'text-[7.2pt] font-bold',
      clauseBody: 'text-[6.8pt] leading-[8.8pt]',
      clauseSpacing: 'space-y-1 mb-1.5',
      sigSectionMargin: 'pt-1 mb-1',
      sigPrompt: 'text-[7pt] font-bold mb-1',
      sigHeight: 'h-7',
      sigName: 'text-[8.5pt] font-bold',
      sigSub: 'text-[6.5pt]',
      witnessHeight: 'h-3.5',
      witnessText: 'text-[6.5pt]',
      witnessMargin: 'pt-1 mt-1',
      juratMargin: 'pt-1 mt-1',
      juratText: 'text-[6.2pt] leading-[8pt]',
      footerMargin: 'pt-1 mt-auto',
      footerText: 'text-[6.5pt]',
    };
  }

  const half = Math.ceil(total / 2);
  const col1Clauses = clauses.slice(0, half);
  const col2Clauses = clauses.slice(half);

  return (
    <div className="hidden print:block print-contract-root bg-white text-black font-serif leading-normal">
      {/* Strict Print CSS: Forces document onto 1 Single A4 Sheet and fills the full height */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 10mm 6mm 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          .app-shell-root, #root, #root > div {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            height: 100% !important;
            min-height: 0 !important;
            display: block !important;
            overflow: hidden !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-contract-root {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .single-page-contract {
            box-sizing: border-box !important;
            width: 100% !important;
            height: 275mm !important;
            min-height: 270mm !important;
            max-height: 275mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .clause-row {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />

      {/* ==================== 1-PAGE OFFICIAL LEGAL CONTRACT ==================== */}
      <div className="single-page-contract">
        <div>
          {/* Formal Legal Caption */}
          <div className="text-center pb-1 mb-1.5 border-b-2 border-black">
            <p className={`uppercase font-sans font-semibold text-black ${scale.caption}`}>
              Republika ng Pilipinas · {address}
            </p>
            <h1 className={`uppercase tracking-tight text-black mt-0.5 font-serif ${scale.title}`}>
              KASULATAN SA PAG-ABANG NG PAUPAHAN
            </h1>
            <p className={`text-black uppercase tracking-wide ${scale.subTitle}`}>
              (CONTRACT OF RESIDENTIAL LEASE — {pType.toUpperCase()})
            </p>
            <p className={`text-black ${scale.citation}`}>
              Isinagawa alinsunod sa Kodigo Sibil ng Pilipinas (Batas Republika Blg. 386) at Rent Control Act
            </p>
          </div>

          {/* Legal Preamble */}
          <div className={`text-black ${scale.preamble}`}>
            <p className="font-bold uppercase tracking-wider text-black">
              ALAMIN NG LAHAT SA PAMAMAGITAN NITO (KNOW ALL MEN BY THESE PRESENTS):
            </p>
            <p className="mt-0.5 text-justify indent-3 text-black">
              Ang Kasulatang ito ng Pag-upa ay pinagkasunduan ngayong ika-<strong>{dateFormatted}</strong> sa <strong>{address}</strong> sa pagitan nina <strong>{lessor}</strong> bilang <strong>NAGPAPAUPA (LESSOR)</strong> na matatagpuan sa <em>{address}</em>{phone ? `, may kontak blg. ${phone}` : ''}; at <strong>{lessee}</strong> bilang <strong>UMUUPA (LESSEE)</strong> para sa <strong>{unit}</strong>.
            </p>
            <p className="mt-0.5 text-justify indent-3 text-black">
              <strong>NAGPAPATUNAY:</strong> Na pinapaupahan ng Nagpapaupa ang nasabing unit sa Umuupa sa ilalim ng mga sumusunod na alituntunin at pinansyal na kasunduan:
            </p>
          </div>

          {/* Schedule of Terms Table */}
          <div className={`border border-black ${scale.tableMargin}`}>
            <div className="grid grid-cols-4 divide-x divide-black text-center">
              <div className={scale.tablePad}>
                <span className={`block font-sans uppercase text-black ${scale.tableHead}`}>Buwanang Abang</span>
                <strong className={`block text-black font-serif ${scale.tableMain}`}>{rentFormatted} / buwan</strong>
                <span className={`block text-black ${scale.tableSub}`}>Bago ika-5 ng buwan</span>
              </div>
              <div className={scale.tablePad}>
                <span className={`block font-sans uppercase text-black ${scale.tableHead}`}>Seguridad Deposit</span>
                <strong className={`block text-black font-serif ${scale.tableMain}`}>{depFormatted}</strong>
                <span className={`block text-black ${scale.tableSub}`}>Maaaring ibalik</span>
              </div>
              <div className={scale.tablePad}>
                <span className={`block font-sans uppercase text-black ${scale.tableHead}`}>Paunang Bayad</span>
                <strong className={`block text-black font-serif ${scale.tableMain}`}>{advFormatted}</strong>
                <span className={`block text-black ${scale.tableSub}`}>Unang buwan ng upa</span>
              </div>
              <div className={scale.tablePad}>
                <span className={`block font-sans uppercase text-black ${scale.tableHead}`}>Haba ng Kontrata</span>
                <strong className={`block text-black font-serif ${scale.tableMain}`}>{duration}</strong>
                <span className={`block text-black ${scale.tableSub}`}>Maaaring i-renew</span>
              </div>
            </div>
          </div>

          {/* Contract Clauses: Adaptive Single-Column or 2-Column */}
          {scale.isTwoCol ? (
            /* 13+ Clauses: 2 Columns */
            <div className="grid grid-cols-2 gap-x-4 pt-1 border-t border-black mb-2">
              <div className={scale.clauseSpacing}>
                {col1Clauses.map((c) => (
                  <div key={c.num} className="clause-row text-black">
                    <p className={scale.clauseTitle}>{c.title.toUpperCase()}</p>
                    <p className={`text-justify indent-2 text-black ${scale.clauseBody}`}>{c.text}</p>
                  </div>
                ))}
              </div>
              <div className={scale.clauseSpacing}>
                {col2Clauses.map((c) => (
                  <div key={c.num} className="clause-row text-black">
                    <p className={scale.clauseTitle}>{c.title.toUpperCase()}</p>
                    <p className={`text-justify indent-2 text-black ${scale.clauseBody}`}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Standard Clauses (1-12 clauses): Generous Single Column filling the page */
            <div className={`pt-1 border-t border-black ${scale.clauseSpacing}`}>
              {clauses.map((c) => (
                <div key={c.num} className="clause-row text-black">
                  <p className={scale.clauseTitle}>{c.title.toUpperCase()}</p>
                  <p className={`text-justify indent-3 text-black ${scale.clauseBody}`}>{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Legal Signatures Section */}
          <div className={`border-t border-black text-black ${scale.sigSectionMargin}`}>
            <p className={`font-serif text-center text-black uppercase tracking-wider ${scale.sigPrompt}`}>
              SA KATUNAYAN NG LAHAT, ang mga partido ay lumagda at nagpatibay nito ngayong araw sa {address}:
            </p>

            {/* Side-by-side Dual Signatures */}
            <div className="grid grid-cols-2 gap-6 text-center my-1">
              {/* Lessor (Nagpapaupa) */}
              <div>
                <div className={`border-b-2 border-black w-48 mx-auto mb-0.5 ${scale.sigHeight} flex items-end justify-center`}>
                  {landlordSigningMode === 'WET_INK' ? (
                    <span className="text-[6.5pt] font-sans text-slate-500 italic mb-0.5">
                      (Lagda gamit ang pluma / Ballpen signature)
                    </span>
                  ) : landlordSignature ? (
                    <img 
                      src={landlordSignature} 
                      alt="Landlord Signature" 
                      className="max-h-7 max-w-[150px] object-contain filter grayscale contrast-200" 
                    />
                  ) : (
                    <span className="font-serif italic font-bold text-[10.5pt] text-black">
                      {lessor}
                    </span>
                  )}
                </div>
                <p className={`font-serif uppercase text-black ${scale.sigName}`}>{lessor}</p>
                <p className={`font-sans font-semibold text-black uppercase ${scale.sigSub}`}>NAGPAPAUPA (Lessor)</p>
                <p className="text-[6.5pt] font-sans text-black">
                  {landlordSigningMode === 'WET_INK' ? 'Wet-Ink Signatory (Art. 1356)' : 'Digital E-Signature Verified (RA 8792)'}
                </p>
                {phone && <p className="text-[6.5pt] font-mono text-black">Kontak: {phone}</p>}
              </div>

              {/* Lessee (Umuupa) */}
              <div>
                <div className={`border-b-2 border-black w-48 mx-auto mb-0.5 ${scale.sigHeight} flex items-end justify-center`}>
                  {signingMode === 'WET_INK' && !signatureData ? (
                    <span className="text-[6.5pt] font-sans text-slate-500 italic mb-0.5">
                      (Lagda gamit ang pluma / Ballpen signature)
                    </span>
                  ) : signatureData ? (
                    <img 
                      src={signatureData} 
                      alt="Signature" 
                      className="max-h-7 max-w-[150px] object-contain filter grayscale contrast-200" 
                    />
                  ) : (
                    <span className="font-serif italic font-bold text-[10.5pt] text-black">
                      ~ {lessee} ~
                    </span>
                  )}
                </div>
                <p className={`font-serif uppercase text-black ${scale.sigName}`}>{lessee}</p>
                <p className={`font-sans font-semibold text-black uppercase ${scale.sigSub}`}>UMUUPA (Lessee)</p>
                <p className="text-[6.5pt] font-sans text-black">
                  {signingMode === 'WET_INK' ? 'Wet-Ink Signatory (Art. 1356)' : 'PhilSys Verified / Lumagda Kusang-loob'}
                </p>
              </div>
            </div>

            {/* Witnesses Block (Saksi) */}
            <div className={`border-t border-dotted border-black ${scale.witnessMargin}`}>
              <p className="text-[6.8pt] font-sans font-bold text-center uppercase tracking-wider text-black mb-1">
                NILAGDAAN SA HARAP NINA (Witnesses):
              </p>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className={`border-b border-black w-44 mx-auto mb-0.5 ${scale.witnessHeight}`}></div>
                  <p className={`font-serif text-black uppercase ${scale.witnessText}`}>Saksi (Witness 1) — Lagda sa Ibabaw ng Pangalan</p>
                </div>
                <div>
                  <div className={`border-b border-black w-44 mx-auto mb-0.5 ${scale.witnessHeight}`}></div>
                  <p className={`font-serif text-black uppercase ${scale.witnessText}`}>Saksi (Witness 2) — Lagda sa Ibabaw ng Pangalan</p>
                </div>
              </div>
            </div>

            {/* Philippine Notarial Jurat (Acknowledgment) */}
            <div className={`border-t border-black text-black ${scale.juratMargin} ${scale.juratText}`}>
              <p className="font-sans font-bold uppercase text-[6.8pt] tracking-wider text-center mb-0.5">
                PAGPAPATUNAY (NOTARIAL ACKNOWLEDGMENT)
              </p>
              <p className="text-justify indent-3">
                REPUBLIKA NG PILIPINAS ) S.S. — SA HARAP KO, isang Notaryo Publiko sa nasabing hurisdiksyon ngayong ika-{dateFormatted}, personal na humarap ang mga partido na nagpakita ng kani-kanilang katibayan ng pagkakakilanlan at pinatunayang ang Kasulatang ito ay kanilang kusang-loob na pagpapasiya.
              </p>
              <div className="flex justify-between items-center text-[6pt] font-mono mt-0.5 font-bold">
                <span>Doc. No. ______;</span>
                <span>Page No. 1;</span>
                <span>Book No. ______;</span>
                <span>Series of {now.getFullYear()}.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Certification Line */}
        <div className={`border-t-2 border-black text-center text-black ${scale.footerMargin}`}>
          <p className="text-[7pt] font-sans font-bold uppercase tracking-wider">
            CERTIFIED OFFICIAL RESIDENTIAL LEASE CONTRACT · RENT IN PEACE (RIP)
          </p>
          <p className={`italic text-black mt-0.5 ${scale.footerText}`}>
            Pinagkasunduan at kusang-loob na nilagdaan ng mga partido alinsunod sa umiiral na batas ng Pilipinas.
          </p>
        </div>
      </div>
    </div>
  );
}
