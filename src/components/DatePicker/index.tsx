import React from 'react'
import { DatePicker as FormilyDatePicker  } from '@formily/antd'
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';


export const DatePicker = (props) => {

  return <FormilyDatePicker locale={locale} {...props}></FormilyDatePicker>
}


export default DatePicker
