// @flow

import Tooltip from '@atlaskit/tooltip';
import React, { Fragment } from 'react';

import { Icon } from '../../icons';

import AbstractToolboxItemCopy from './AbstractToolboxItemCopy';
import type { Props } from './AbstractToolboxItemCopy';

/**
 * Web implementation of {@code AbstractToolboxItem}.
 */
export default class ToolboxItemCopy extends AbstractToolboxItemCopy<Props> {
    /**
     * Handles rendering of the actual item. If the label is being shown, which
     * is controlled with the `showLabel` prop, the item is rendered for its
     * display in an overflow menu, otherwise it will only have an icon, which
     * can be displayed on any toolbar.
     *
     * @protected
     * @returns {ReactElement}
     */
    _renderItem() {
        const {
            disabled,
            elementAfter,
            onClick,
            showLabel,
            tooltipPosition
        } = this.props;
        const className = showLabel ? 'overflow-menu-item' : 'toolbox-button';
        const props = {
            'aria-label': this.accessibilityLabel,
            className: className + (disabled ? ' disabled' : ''),
            onClick: disabled ? undefined : onClick
        };
        const elementType = showLabel ? 'span' : 'div';
        const useTooltip = this.tooltip && this.tooltip.length > 0;
        let children = (
            <Fragment>
                <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'blue', cursor: "pointer" }}>
                    {showLabel && <span>
                        <b>{this.label}</b>
                    </span>}
                </div>
            </Fragment>
        );

        if (useTooltip) {
            children = (
                <Tooltip
                    content={this.tooltip}
                    position={tooltipPosition}>
                    {children}
                </Tooltip>
            );
        }

        return React.createElement(elementType, props, children);
    }

    /**
     * Helper function to render the item's icon.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderIcon() {
        const { customClass, disabled, icon, showLabel, toggled } = this.props;
        const iconComponent = '';
        const elementType = showLabel ? 'span' : 'div';
        const className = `${showLabel ? 'overflow-menu-item-icon' : 'toolbox-icon'} ${
            toggled ? 'toggled' : ''} ${disabled ? 'disabled' : ''} ${customClass ?? ''}`;

        return React.createElement(elementType, { className }, iconComponent);
    }
}
