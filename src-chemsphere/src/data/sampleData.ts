import type { Chemical } from '../utils/storage'

export const SAMPLE_CHEMICALS: Chemical[] = [
  {
    id: '1',
    name: 'Ethanol',
    batchNumber: 'B-1001',
    brand: 'ChemCo',
    physicalState: { type: 'volume', unit: 'mL' },
    initialQuantity: 500,
    currentQuantity: 120,
    arrivalDate: '2024-01-10',
    expirationDate: new Date(Date.now() + 60*24*3600*1000).toISOString().slice(0,10),
    safetyClass: 'red',
    location: 'Shelf A',
    ghsSymbol: '🔥',
    dateAdded: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sodium Hydroxide',
    batchNumber: 'B-2002',
    brand: 'LabPure',
    physicalState: { type: 'mass', unit: 'g' },
    initialQuantity: 1000,
    currentQuantity: 400,
    arrivalDate: '2023-06-05',
    expirationDate: new Date(Date.now() - 2*24*3600*1000).toISOString().slice(0,10),
    safetyClass: 'white',
    location: 'Cabinet B',
    ghsSymbol: '⚠️',
    dateAdded: new Date().toISOString(),
  }
]
