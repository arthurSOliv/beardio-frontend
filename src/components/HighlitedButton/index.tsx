import React, { ButtonHTMLAttributes } from 'react';

import { Container } from './styles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  onClick: any;
};

const HighlitedButton: React.FC<ButtonProps> = ({ children, selected, onClick, ...rest }) => (
  <Container selected={selected} type="button" onClick={() => onClick()} {...rest}>
    {children}
  </Container>
);

export default HighlitedButton;