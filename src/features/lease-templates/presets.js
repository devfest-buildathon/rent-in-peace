// Lease Templates & Presets - Owned by Agent C per COORDINATION.md

/**
 * Validates required contract parameters before generating the contract
 */
export function validateContractRequirements({ landlordName, tenantName: _tenantName, roomNumber, propertyAddress, monthlyRent }) {
  const errors = [];
  if (!landlordName || !landlordName.trim()) {
    errors.push('Lessor (Landlord) legal name is required.');
  }
  if (!roomNumber || !roomNumber.trim()) {
    errors.push('Room or unit identifier is required.');
  }
  if (!propertyAddress || !propertyAddress.trim()) {
    errors.push('Property address / city location is required.');
  }
  if (!monthlyRent || Number(monthlyRent) <= 0) {
    errors.push('A valid monthly rent amount is required.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Retrieves baseline statutory lease clauses compliant with the Civil Code of the Philippines & Rent Control Act
 */
export function getPresetClauses(_presetId = 'standard') {
  return [
    {
      num: 1,
      title: '1. Parties to the Agreement',
      text: 'This residential lease agreement is entered into by the Lessor and Lessee named herein for the designated residential premises.'
    },
    {
      num: 2,
      title: '2. Leased Premises',
      text: 'The Lessor hereby leases the specified room and dwelling unit exclusively for peaceful residential occupancy.'
    },
    {
      num: 3,
      title: '3. Rent and Security Deposit',
      text: 'Monthly rent is payable on or before the 5th day of each calendar month. Security deposit and advance rent are maintained in accordance with the Rent Control Act.'
    },
    {
      num: 4,
      title: '4. Lease Term',
      text: 'The lease commences on the agreed move-in date for the designated duration, renewable upon mutual written consent of both parties.'
    },
    {
      num: 5,
      title: '5. Utilities and Operating Expenses',
      text: 'Tenant agrees to settle electric sub-meter readings and shared water utility allocations promptly upon statement delivery.'
    },
    {
      num: 6,
      title: '6. House Rules & Peaceful Dwelling',
      text: 'Quiet hours begin at 10:00 PM. Passageways, corridors, and communal facilities must remain clean and unobstructed at all times.'
    },
    {
      num: 7,
      title: '7. Maintenance & Care of Premises',
      text: 'The Lessee shall maintain the room in tenantable, sanitary condition and promptly inform the Lessor of any required plumbing or structural repairs.'
    },
    {
      num: 8,
      title: '8. Move-Out Notice & Termination',
      text: 'Either party may terminate this agreement by tendering at least 30 days prior written notice in accordance with Philippine law.'
    }
  ];
}

/**
 * Renders lease content with dynamic party and financial values
 */
export function renderLease(presetId, values = {}) {
  const {
    landlordName,
    tenantName,
    roomNumber,
    propertyAddress,
    propertyType = 'Boarding House / Bedspace',
    monthlyRent,
    deposit,
    advanceRent,
    leaseDuration = '6 months',
    customClauses = []
  } = values;

  const rentStr = monthlyRent ? `₱${Number(monthlyRent).toLocaleString()}` : '₱[Amount]';
  const depStr = deposit ? `₱${Number(deposit).toLocaleString()}` : '₱[Amount]';
  const advStr = advanceRent ? `₱${Number(advanceRent).toLocaleString()}` : '₱[Amount]';

  const base = [
    {
      num: 1,
      title: '1. Parties to the Agreement',
      text: `This residential lease agreement is entered into by ${landlordName || '[Lessor Name]'} (Lessor) and ${tenantName || '[Lessee Name]'} (Lessee).`
    },
    {
      num: 2,
      title: '2. Leased Premises',
      text: `The Lessor hereby leases ${roomNumber || '[Unit/Room]'} situated at ${propertyAddress || '[Property Address]'} (${propertyType}) strictly for residential dwelling.`
    },
    {
      num: 3,
      title: '3. Rent and Financial Obligations',
      text: `Monthly rent is ${rentStr}, due on or before the 5th of each month. A security deposit of ${depStr} and advance rent of ${advStr} are required upon contract execution.`
    },
    {
      num: 4,
      title: '4. Lease Term',
      text: `The lease takes effect for an agreed initial duration of ${leaseDuration}, renewable upon mutual written agreement.`
    },
    {
      num: 5,
      title: '5. Utilities and Operating Expenses',
      text: 'Electricity and water utility allocations are to be paid by the tenant upon monthly statement presentation.'
    },
    {
      num: 6,
      title: '6. House Rules & Peaceful Dwelling',
      text: 'Quiet hours begin at 10:00 PM. Common passageways and bathrooms must be kept clean. Unauthorized subleasing is prohibited.'
    },
    {
      num: 7,
      title: '7. Maintenance & Repairs',
      text: 'The Lessee shall maintain the room in tenantable condition and promptly notify the Lessor of any required structural or plumbing repairs.'
    },
    {
      num: 8,
      title: '8. Termination Notice',
      text: 'Either party may terminate this lease by providing at least thirty (30) days prior written notice.'
    }
  ];

  if (Array.isArray(customClauses) && customClauses.length > 0) {
    customClauses.forEach((c) => {
      base.push({
        num: base.length + 1,
        title: c.title || `${base.length + 1}. Special Landlord Condition`,
        text: c.text,
        isCustom: true,
        customNotice: 'Custom clause added by landlord. Landlord is responsible for reviewing custom terms.'
      });
    });
  }

  return base;
}
