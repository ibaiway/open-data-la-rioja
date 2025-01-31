import database from './shared/database'
import { getYearFromTimeDto } from './shared/utils'
import { config } from '@/config'
import { type ChartData } from '@/types'

interface ForeignInmigrationDto {
  '[SEXO]': string
  '[EDAD GRUPOS QUINQUENALES]': string
  '[PAÍS DE ORIGEN/DESTINO]': string
  '[TIEMPO]': string
  '[Measures].[Movimientos migratorios (La Rioja)]': number
}

interface InmigrationDto {
  '[Measures].[Movimientos migratorios]': number
  '[SEXO]': string
  '[TIEMPO]': string
  '[CCAA DE DESTINO]': string
}

interface Inmigration {
  destination: string
  year: number
  measure: number
  ageGroup: string
}

const TotalKey = 'Total' as const

// [EDAD GRUPOS QUINQUENALES].[50 a 54 años] -> 50 a 54 años
function getAgeGroup (ageGroup: string): string {
  const ageGroupPart = ageGroup.split('.')[1]
  if (!ageGroupPart) {
    throw new Error(`Invalid age group in: ${ageGroup}`)
  }

  return ageGroupPart.replace('[', '').replace(']', '').trim()
}

// [PAÍS DE ORIGEN/DESTINO].[América del Norte] -> América del Norte
// [CCAA DE DESTINO].[Andalucía] -> Andalucía
function getDestination (destination: string): string {
  const destinationPart = destination.split('.')[1]
  if (!destinationPart) {
    throw new Error(`Invalid destination in: ${destination}`)
  }

  return destinationPart.replace('[', '').replace(']', '').trim()
}

async function getForeignInmigrations (): Promise<Inmigration[]> {
  const response = await database.get<ForeignInmigrationDto>(config.foreign_inmigration.fileName)

  return response.map(dto => {
    return {
      destination: getDestination(dto['[PAÍS DE ORIGEN/DESTINO]']),
      year: getYearFromTimeDto(dto['[TIEMPO]']),
      measure: dto['[Measures].[Movimientos migratorios (La Rioja)]'],
      ageGroup: getAgeGroup(dto['[EDAD GRUPOS QUINQUENALES]'])
    }
  })
}

export async function getInmigrations (): Promise<Inmigration[]> {
  const response = await database.get<InmigrationDto>(config.inmigration.fileName)

  return response.map(dto => {
    return {
      destination: getDestination(dto['[CCAA DE DESTINO]']),
      year: getYearFromTimeDto(dto['[TIEMPO]']),
      measure: dto['[Measures].[Movimientos migratorios]'],
      ageGroup: dto['[SEXO]']
    }
  })
}

export async function getForeignEmigrationPerYear (): Promise<ChartData> {
  const foreignInmigrations = await getForeignInmigrations()

  const years = [...new Set(foreignInmigrations.map(wa => wa.year).sort((a, b) => a - b))]

  const data = years.map(year => {
    const yearData = foreignInmigrations.filter(wa => wa.year === year)
    const total = yearData.find(wa => wa.destination === TotalKey)?.measure ?? 0
    return {
      year,
      'Inmigración exterior': total
    }
  })

  return {
    index: 'year',
    categories: ['Inmigración exterior'],
    data
  }
}

export async function getInmigrationPerYear (): Promise<ChartData> {
  const foreignInmigrations = await getInmigrations()

  const years = [...new Set(foreignInmigrations.map(wa => wa.year).sort((a, b) => a - b))]
  const currentYear = new Date().getFullYear()

  const data = years
    .filter(year => year <= currentYear)
    .map(year => {
      const yearData = foreignInmigrations.filter(wa => wa.year === year)
      const total = yearData.find(wa => wa.destination === TotalKey)?.measure ?? 0
      return {
        year,
        Inmigración: total
      }
    })

  return {
    index: 'year',
    categories: ['Inmigración'],
    data
  }
}
