// @BackgroundMenu.js

import { getLocalVideoTrack } from '../../features/base/tracks';

import { BLUR_DISABLED, BLUR_ENABLED } from './actionTypes';
import { getBlurEffect } from './functions';
import logger from './logger';

//// End import BackgroundMenu.js
// @flow

import type { Dispatch } from 'redux';

import { FEEDBACK_REQUEST_IN_PROGRESS } from '../../../modules/UI/UIErrors';
import { openDialog } from '../base/dialog';

import {
    CANCEL_FEEDBACK,
    SUBMIT_FEEDBACK_ERROR,
    SUBMIT_FEEDBACK_SUCCESS
} from './actionTypes';
import { FeedbackDialog } from './components';

declare var config: Object;
declare var interfaceConfig: Object;

/**
 * Caches the passed in feedback in the redux store.
 *
 * @param {number} score - The quality score given to the conference.
 * @param {string} message - A description entered by the participant that
 * explains the rating.
 * @returns {{
 *     type: CANCEL_FEEDBACK,
 *     message: string,
 *     score: number
 * }}
 */
export function cancelFeedback(score: number, message: string) {
    return {
        type: CANCEL_FEEDBACK,
        message,
        score
    };
}

/**
 * Potentially open the {@code FeedbackDialog}. It will not be opened if it is
 * already open or feedback has already been submitted.
 *
 * @param {JistiConference} conference - The conference for which the feedback
 * would be about. The conference is passed in because feedback can occur after
 * a conference has been left, so references to it may no longer exist in redux.
 * @returns {Promise} Resolved with value - false if the dialog is enabled and
 * resolved with true if the dialog is disabled or the feedback was already
 * submitted. Rejected if another dialog is already displayed.
 */
export function maybeOpenFeedbackDialog(conference: Object) {
    type R = {
        feedbackSubmitted: boolean,
        showThankYou: boolean
    };

    return (dispatch: Dispatch<any>, getState: Function): Promise<R> => {
        const state = getState();
        const { feedbackPercentage = 100 } = state['features/base/config'];

        if (interfaceConfig.filmStripOnly || config.iAmRecorder) {
            // Intentionally fall through the if chain to prevent further action
            // from being taken with regards to showing feedback.
        } else if (state['features/base/dialog'].component === FeedbackDialog) {
            // Feedback is currently being displayed.

            return Promise.reject(FEEDBACK_REQUEST_IN_PROGRESS);
        } else if (state['features/feedback'].submitted) {
            // Feedback has been submitted already.

            return Promise.resolve({
                feedbackSubmitted: true,
                showThankYou: true
            });
        } else if (conference.isCallstatsEnabled() && feedbackPercentage > Math.random() * 100) {
            return new Promise(resolve => {
                dispatch(openBackgroundMenuDialog(conference, () => {
                    const { submitted } = getState()['features/feedback'];

                    resolve({
                        feedbackSubmitted: submitted,
                        showThankYou: false
                    });
                }));
            });
        }

        // If the feedback functionality isn't enabled we show a "thank you"
        // message. Signaling it (true), so the caller of requestFeedback can
        // act on it.
        return Promise.resolve({
            feedbackSubmitted: false,
            showThankYou: true
        });
    };
}

/**
 * Opens {@code FeedbackDialog}.
 *
 * @param {JitsiConference} conference - The JitsiConference that is being
 * rated. The conference is passed in because feedback can occur after a
 * conference has been left, so references to it may no longer exist in redux.
 * @param {Function} [onClose] - An optional callback to invoke when the dialog
 * is closed.
 * @returns {Object}
 */
export function openBackgroundMenuDialog(conference: Object, onClose: ?Function) {
    return openDialog(FeedbackDialog, {
        conference,
        onClose
    });
}

/**
 * Send the passed in feedback.
 *
 * @param {number} score - An integer between 1 and 5 indicating the user
 * feedback. The negative integer -1 is used to denote no score was selected.
 * @param {string} message - Detailed feedback from the user to explain the
 * rating.
 * @param {JitsiConference} conference - The JitsiConference for which the
 * feedback is being left.
 * @returns {Function}
 */
export function submitFeedback(
    score: number,
    message: string,
    conference: Object) {
    return (dispatch: Dispatch<any>) => conference.sendFeedback(score, message)
        .then(
            () => dispatch({ type: SUBMIT_FEEDBACK_SUCCESS }),
            error => {
                dispatch({
                    type: SUBMIT_FEEDBACK_ERROR,
                    error
                });

                return Promise.reject(error);
            }
        );
}

// backgroundMenu
/**
* Signals the local participant is switching between blurred or non blurred video.
*
* @param {boolean} enabled - If true enables video blur, false otherwise.
* @returns {Promise}
*/
export function toggleBlurEffectC(enabled: boolean, myName: String) {
    return function (dispatch: (Object) => Object, getState: () => any) {
        const state = getState();
        if (state['features/blur'].blurEnabled !== enabled) {
            const { jitsiTrack } = getLocalVideoTrack(state['features/base/tracks']);

            return getBlurEffect(myName)
                .then(blurEffectInstance =>
                    jitsiTrack.setEffect(enabled ? blurEffectInstance : undefined)
                        .then(() => {
                            enabled ? dispatch(blurEnabled()) : dispatch(blurDisabled());
                        })
                        .catch(error => {
                            enabled ? dispatch(blurDisabled()) : dispatch(blurEnabled());
                            logger.error('setEffect failed with error:', error);
                        })
                )
                .catch(error => {
                    dispatch(blurDisabled());
                    logger.error('getBlurEffect failed with error:', error);
                });
        }

        return Promise.resolve();
    };
}

/**
 * Signals the local participant that the blur has been enabled.
 *
 * @returns {{
 *      type: BLUR_ENABLED
 * }}
 */
export function blurEnabled() {
    return {
        type: BLUR_ENABLED
    };
}

/**
 * Signals the local participant that the blur has been disabled.
 *
 * @returns {{
 *      type: BLUR_DISABLED
 * }}
 */
export function blurDisabled() {
    return {
        type: BLUR_DISABLED
    };
}

// End backgroundMenu