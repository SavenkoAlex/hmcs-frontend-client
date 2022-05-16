import axios from 'axios'
import {
  IMenuItem,
  IMenu
} from '@backend/db/models/appStructure'

async function getNavigationItems (): Promise < [IMenu<IMenuItem>] | null> {
  const response = await axios.request <[IMenu<IMenuItem>]>({
    url: '/api/view/menu/all',
    method: 'GET'
  })
  const { data } = response
  return data || null
}

export {
  getNavigationItems
}
