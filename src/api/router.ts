import axios from 'axios'

interface IMenuItem {
  label: string,
  path: string,
  icon: string | null
}

interface IMenu {
  menuItems: IMenuItem[]
}

async function getNavigationItems (): Promise < [IMenu] | null> {
  const response = await axios.request <[IMenu]>({
    url: '/api/view/menu/all',
    method: 'GET'
  })
  const { data } = response
  return data || null
}

export {
  getNavigationItems
}
