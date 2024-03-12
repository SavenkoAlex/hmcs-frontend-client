import { 
  ElementScale, 
  SidePosition,
  Maybe,
  ValidationError
} from '@/global/global'

export const getSizeHash = (small: string, medium: string, large: string) => {
  return {
    [ElementScale.LARGE]: large,
    [ElementScale.MEDIUM]: medium,
    [ElementScale.SMALL]: small
  }
}

type FlexOrientation = {
  'flex-direction': 'row' | 'column',
  'justify-content': 'flex-start' | 'flex-end'
}

export const getFlexOrientation = (side: SidePosition): FlexOrientation => {
  const direction: 'row' | 'column' = side === SidePosition.LEFT || side === SidePosition.RIGHT
        ? 'row'
        : 'column'

      const justify: 'flex-start' | 'flex-end' = side === SidePosition.TOP || side === SidePosition.LEFT
        ? 'flex-start'
        : 'flex-end'

      return {
        'flex-direction': direction,
        'justify-content': justify
      }
}


export const emptyfieldValidation = (value: Maybe <string>) => {

  if (value && value?.length) {
    return false
  }

  return ValidationError.EMPTY_FIELD
}

