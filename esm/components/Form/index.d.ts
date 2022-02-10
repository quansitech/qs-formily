import React from 'react';
import { FormProps as FomilyFormProps } from '@formily/antd';
export declare type FormLayoutType = 'vertical' | 'horizontal';
export interface FormProps extends FomilyFormProps {
    formLayout?: FormLayoutType;
}
export declare const Form: React.FC<FormProps>;
export default Form;
