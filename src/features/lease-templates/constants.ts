import { LeasePreset, PlaceholderDefinition } from './types';

export const AVAILABLE_PLACEHOLDERS: PlaceholderDefinition[] = [
  {
    key: 'tenant_name',
    placeholder: '{{tenant_name}}',
    label: 'Tenant Name',
    description: 'Full legal name of the tenant / lessee',
    sampleValue: 'Juan M. dela Cruz'
  },
  {
    key: 'landlord_name',
    placeholder: '{{landlord_name}}',
    label: 'Landlord Name',
    description: 'Full legal name of the landlord / lessor',
    sampleValue: 'Maria Clarissa Santos'
  },
  {
    key: 'unit',
    placeholder: '{{unit}}',
    label: 'Unit / Room',
    description: 'Identifier of the rented room, stall, or unit',
    sampleValue: 'Bedspace Room 2B'
  },
  {
    key: 'property_address',
    placeholder: '{{property_address}}',
    label: 'Property Address',
    description: 'Complete physical location of the rental property',
    sampleValue: 'Pabayo St., Divisoria, Cagayan de Oro City'
  },
  {
    key: 'rent',
    placeholder: '{{rent}}',
    label: 'Monthly Rent',
    description: 'Monthly rental fee with currency symbol',
    sampleValue: '₱2,800'
  },
  {
    key: 'deposit',
    placeholder: '{{deposit}}',
    label: 'Security Deposit',
    description: 'Refundable security deposit amount',
    sampleValue: '₱2,800'
  },
  {
    key: 'advance',
    placeholder: '{{advance}}',
    label: 'Advance Rent',
    description: 'Advance rental payment amount upon moving in',
    sampleValue: '₱2,800'
  },
  {
    key: 'due_day',
    placeholder: '{{due_day}}',
    label: 'Payment Due Day',
    description: 'Day of the month rent is due (e.g. 5th)',
    sampleValue: '5th'
  },
  {
    key: 'lease_duration',
    placeholder: '{{lease_duration}}',
    label: 'Lease Duration',
    description: 'Agreed duration of the lease term',
    sampleValue: '6 months'
  },
  {
    key: 'start_date',
    placeholder: '{{start_date}}',
    label: 'Start Date',
    description: 'Lease commencement date',
    sampleValue: 'December 1, 2026'
  }
];

export const SAMPLE_PLACEHOLDER_VALUES: Record<string, string> = {
  tenant_name: 'Juan M. dela Cruz',
  landlord_name: 'Maria Clarissa Santos',
  unit: 'Bedspace Room 2B',
  property_address: 'Pabayo St., Divisoria, Cagayan de Oro City',
  rent: '₱2,800',
  deposit: '₱2,800',
  advance: '₱2,800',
  due_day: '5th',
  lease_duration: '6 months',
  start_date: 'December 1, 2026'
};

export const BUILTIN_PRESETS: LeasePreset[] = [
  {
    id: 'builtin-bedspace',
    name: 'Bedspace / Boarding House',
    description: 'Standard terms for shared boarding houses: curfew, quiet hours, shared utilities, and visitor limits.',
    isBuiltIn: true,
    clauses: [
      {
        id: 'c-parties',
        title: 'Parties to the Agreement',
        english: 'This residential bedspace lease agreement is entered into by {{landlord_name}} (Lessor) and {{tenant_name}} (Lessee).',
        bisaya: 'Kini nga kasulatan sa pag-abang sa bedspace gihimo tali nila {{landlord_name}} (Tag-iya/Lessor) ug {{tenant_name}} (Umuupa/Lessee).',
        enabled: true,
        category: 'parties'
      },
      {
        id: 'c-premises',
        title: 'Designated Space & Use',
        english: 'The Lessor leases {{unit}} situated at {{property_address}} strictly for single-occupant residential bedspace lodging.',
        bisaya: 'Ang Tag-iya nagpaabang sa {{unit}} nga nahimutang sa {{property_address}} alang lamang sa personal ug malinawon nga pagpuyo.',
        enabled: true,
        category: 'premises'
      },
      {
        id: 'c-rent',
        title: 'Rent & Due Date',
        english: 'The monthly rental rate is {{rent}}, payable promptly on or before the {{due_day}} of each calendar month without need of prior demand.',
        bisaya: 'Ang binulan nga abang maoy {{rent}}, nga pagabayran sa o sa dili pa ang ika-{{due_day}} nga adlaw sa matag bulan nga dili na kinahanglan og pahinumdom.',
        enabled: true,
        category: 'rent'
      },
      {
        id: 'c-deposit',
        title: 'Advance & Security Deposit',
        english: 'The Lessee shall furnish a security deposit of {{deposit}} and advance rent of {{advance}} prior to physical move-in.',
        bisaya: 'Ang Umuupa maghatag og deposito nga {{deposit}} ug abante nga abang nga {{advance}} sa dili pa hingpit nga mobalhin.',
        enabled: true,
        category: 'deposit'
      },
      {
        id: 'c-utilities',
        title: 'Shared Utilities Split',
        english: 'Water and basic electrical consumption for authorized personal gadgets are divided equally among all active boarders.',
        bisaya: 'Ang bayranan sa tubig ug kuryente alang sa mga gitugotan nga gadyet bahinon og patas sa tanang mga boarders.',
        enabled: true,
        category: 'utilities'
      },
      {
        id: 'c-curfew',
        title: 'Curfew & Quiet Hours',
        english: 'Main gate closes at 10:00 PM. Quiet hours are strictly observed from 10:00 PM to 6:00 AM to preserve neighborhood peace.',
        bisaya: 'Manirado ang gawas nga gate sa alas 10:00 sa gabii. Gidili ang saba gikan 10:00 sa gabii hangtud 6:00 sa buntag para sa kalinaw sa tanan.',
        enabled: true,
        category: 'curfew'
      },
      {
        id: 'c-visitors',
        title: 'Visitors Policy',
        english: 'Visiting guests are allowed in designated common areas only until 9:00 PM. No unauthorized overnight visitors are permitted.',
        bisaya: 'Ang mga bisita gitugotan lamang sa hawanan hangtud 9:00 sa gabii. Gidili ang pagpapatulog og bisita nga walay pananghid sa tag-iya.',
        enabled: true,
        category: 'visitors'
      },
      {
        id: 'c-notice',
        title: 'Move-Out Notice',
        english: 'The Lessee must provide a written move-out notice at least 30 days prior to departure for orderly clearance inspection.',
        bisaya: 'Kinahanglan magpahibalo ang Umuupa pinaagi sa sinulat labing menos 30 ka adlaw sa dili pa mobiya alang sa clearance inspection.',
        enabled: true,
        category: 'termination'
      }
    ]
  },
  {
    id: 'builtin-room-cr',
    name: 'Private Room with CR',
    description: 'Suited for single or couple rooms with private ensuite toilet/bath and sub-metered electricity.',
    isBuiltIn: true,
    clauses: [
      {
        id: 'c-parties-cr',
        title: 'Parties to the Agreement',
        english: 'This residential room lease agreement is entered into by {{landlord_name}} (Lessor) and {{tenant_name}} (Lessee).',
        bisaya: 'Kini nga kasulatan sa pag-abang gikasabutan tali nila {{landlord_name}} (Lessor) ug {{tenant_name}} (Lessee).',
        enabled: true,
        category: 'parties'
      },
      {
        id: 'c-premises-cr',
        title: 'Leased Room & Private Bathroom',
        english: 'The Lessor leases {{unit}} with an attached private comfort room (CR) located at {{property_address}} for residential occupancy.',
        bisaya: 'Gipaabangan sa Lessor ang {{unit}} nga dunay kaugalingong kasilyas (CR) nga nahimutang sa {{property_address}} alang sa puy-anan.',
        enabled: true,
        category: 'premises'
      },
      {
        id: 'c-rent-cr',
        title: 'Monthly Rent & Payment Due',
        english: 'Monthly rent is fixed at {{rent}}, payable on or before the {{due_day}} day of every month through cash or GCash.',
        bisaya: 'Ang binuwan nga abang nagkantidad og {{rent}}, bayran sa o sa dili pa ang ika-{{due_day}} nga adlaw sa matag bulan pinaagi sa kwarta o GCash.',
        enabled: true,
        category: 'rent'
      },
      {
        id: 'c-deposit-cr',
        title: 'Security Deposit & Advance',
        english: 'A refundable security deposit of {{deposit}} and one month advance rent of {{advance}} are required upon turnover of room keys.',
        bisaya: 'Gikinahanglan ang security deposit nga {{deposit}} ug usa ka bulan nga advance nga {{advance}} inig dawat sa yawi sa kwarto.',
        enabled: true,
        category: 'deposit'
      },
      {
        id: 'c-submeter',
        title: 'Electric Sub-meter & Water',
        english: 'Electricity is monitored via an independent sub-meter and billed at prevailing rate per kWh. Water is billed at a fixed rate per head.',
        bisaya: 'Ang kuryente base sa kaugalingong sub-meter ug bayran base sa nakonsumo nga kWh. Ang tubig bayran kada tawo sumala sa nasabutan.',
        enabled: true,
        category: 'utilities'
      },
      {
        id: 'c-sanitation',
        title: 'Bathroom Sanitation & Maintenance',
        english: 'The Lessee is solely responsible for maintaining the cleanliness, hygiene, and drain fixtures of the private bathroom.',
        bisaya: 'Ang Umuupa maoy responsable sa pagpanglimpyo ug pag-atiman sa kaugalingong kasilyas (CR) ug mga lababo niini.',
        enabled: true,
        category: 'rules'
      },
      {
        id: 'c-conduct',
        title: 'Community Peace & Prohibited Activities',
        english: 'Excessive noise, smoking indoors, illegal drugs, and gambling on the premises are strictly prohibited.',
        bisaya: 'Gidili ang subrang kasaba, pagpanigarilyo sulod sa kwarto, ilegal nga droga, ug bisan unsang sugal sulod sa compound.',
        enabled: true,
        category: 'rules'
      },
      {
        id: 'c-term-cr',
        title: 'Lease Duration & Termination Notice',
        english: 'The lease term is {{lease_duration}}. Non-renewal or termination requires 30 days prior formal written notification.',
        bisaya: 'Ang gidugayon sa abang mao ang {{lease_duration}}. Gikinahanglan ang 30 ka adlaw nga abanteng pahibalo sa dili pa mobiya o dili mo-renew.',
        enabled: true,
        category: 'termination'
      }
    ]
  },
  {
    id: 'builtin-apartment',
    name: 'Apartment / Studio Unit',
    description: 'Complete self-contained dwelling unit with exclusive entrance, separate utilities, and comprehensive maintenance terms.',
    isBuiltIn: true,
    clauses: [
      {
        id: 'c-parties-apt',
        title: 'Contracting Parties',
        english: 'This residential lease contract is made by and between {{landlord_name}} (Lessor) and {{tenant_name}} (Lessee).',
        bisaya: 'Kini nga kasulatan sa pag-abang gihimo tali kang {{landlord_name}} (Lessor) ug {{tenant_name}} (Lessee).',
        enabled: true,
        category: 'parties'
      },
      {
        id: 'c-premises-apt',
        title: 'Apartment Description',
        english: 'The Lessor leases the apartment unit identified as {{unit}}, located at {{property_address}}, exclusively for private dwelling.',
        bisaya: 'Gipaabangan sa Lessor ang apartment unit nga {{unit}}, nahimutang sa {{property_address}}, alang lamang sa pribadong puy-anan.',
        enabled: true,
        category: 'premises'
      },
      {
        id: 'c-rent-apt',
        title: 'Rental Consideration & Schedule',
        english: 'Rent is {{rent}} per month, payable in advance on or before the {{due_day}} day of each calendar month.',
        bisaya: 'Ang abang maoy {{rent}} matag bulan, bayran abante sa o sa dili pa ang ika-{{due_day}} nga adlaw sa matag bulan.',
        enabled: true,
        category: 'rent'
      },
      {
        id: 'c-deposit-apt',
        title: 'Deposit & Guarantee Conditions',
        english: 'Lessee pays a deposit of {{deposit}} to answer for unpaid utility bills or physical property damage, and advance of {{advance}}.',
        bisaya: 'Ang Umuupa mobayad og deposito nga {{deposit}} alang sa bayronon sa kuryente/tubig o kadaot sa apartment, ug advance nga {{advance}}.',
        enabled: true,
        category: 'deposit'
      },
      {
        id: 'c-utilities-apt',
        title: 'Utility Accounts & Direct Payment',
        english: 'Lessee shall directly pay for all electricity, water, internet, and sanitation services servicing the leased apartment unit.',
        bisaya: 'Ang Umuupa maoy direktang mobayad sa kuryente, tubig, internet, ug bayranan sa basura nga para sa maong apartment.',
        enabled: true,
        category: 'utilities'
      },
      {
        id: 'c-alterations',
        title: 'Maintenance, Repairs & Alterations',
        english: 'Lessee shall not make structural alterations, wall perforations, or electrical modifications without prior written Lessor consent.',
        bisaya: 'Gidili ang pag-usab sa struktura, paglungag sa bongbong, o pag-usab sa linya sa kuryente nga walay sinulat nga pagtugot sa Lessor.',
        enabled: true,
        category: 'rules'
      },
      {
        id: 'c-inspection',
        title: 'Right of Periodic Inspection',
        english: 'The Lessor or authorized representative reserves the right to inspect the premises with 24 hours prior reasonable notice.',
        bisaya: 'Ang Lessor dunay katungod sa pagsusi sa kahimtang sa apartment human makahatag og 24 ka oras nga pahibalo sa Umuupa.',
        enabled: true,
        category: 'rules'
      },
      {
        id: 'c-duration-apt',
        title: 'Term & Move-Out Clearance',
        english: 'The lease is valid for {{lease_duration}}. Notice of departure must be served in writing 30 days ahead; deposit is returned after final bills clearance.',
        bisaya: 'Ang kasabutan molungtad og {{lease_duration}}. Ang pagbiya kinahanglan ipahibalo 30 ka adlaw una pa; ang deposito iuli human mabayran ang tanang obligasyon.',
        enabled: true,
        category: 'termination'
      }
    ]
  }
];
