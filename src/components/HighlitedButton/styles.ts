import styled, { css } from 'styled-components';

interface ContainerProps {
    selected: boolean;
}

export const Container = styled.button<ContainerProps>`
    background: transparent;
    height: 56px;
    border: 0;
    padding: 0 16px;
    color: #ffffff;
    width: 100%;
    font-weight: 500;
    margin-top: 16px;
    transition: background-color 0.2s;
    ${props =>
    props.selected &&
    css`
      border-bottom: 2px solid #fff;
    `}
`;