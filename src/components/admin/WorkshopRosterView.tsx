import React from 'react'

import { fetchRosterData } from './roster/fetchRosterData'
import { RosterClient } from './roster/RosterClient'

export const WorkshopRosterView: React.FC = async () => {
  const data = await fetchRosterData()
  return <RosterClient initialData={data} />
}
