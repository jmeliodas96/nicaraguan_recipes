import {expect, Locator, Page} from '@playwright/test';
// import { circularData, circularTypes } from '../data/circularData';

export class RecipeModel {

    readonly page: Page;
    readonly howToHeader: Locator;
    readonly videoContainer: Locator;
    readonly youTubeFrame: Locator;
    readonly youTubePlayerField: Locator;
    readonly youTubePlayButton: Locator;
    readonly youTubeMuteButton: Locator;

    constructor(page: Page){
        this.page = page;
        this.howToHeader = page.locator('app-frontend > div > nav > app-navigation-panel section:nth-child(1) > div > mat-action-list > app-navigation-panel-item > mat-list-item > span > p:text-is("How To")');
        this.videoContainer = page.locator('app-circular-howto-dialog');
        this.youTubeFrame = page.locator('iframe[frameborder="0"]');
        this.youTubePlayerField = page.locator('body[dir="ltr"]');
        this.youTubePlayButton = page.locator('button.ytp-play-button.ytp-button');
        this.youTubeMuteButton = page.locator('button.ytp-mute-button.ytp-button');
    }

    /**
     * This function clicks the How To header
     */
    async ClickHowToHeader(){
        let howToHeaderVisible: boolean;
        for(let i = 0; i < 60; i++){
            howToHeaderVisible = await this.howToHeader.isVisible();
            if(howToHeaderVisible){
                break;
            }
            await this.page.waitForTimeout(300);
        }

        await this.howToHeader.click();
    }

    /**
     * This function verifies that the iframe video is visible
     */
    async verifyThatVideoPlayerIsVisible(){
        let videoIframeVisible: boolean;
        for(let i = 0; i < 60; i++){
            videoIframeVisible = await this.videoContainer.isVisible();
            if(videoIframeVisible){
                break;
            }
            await this.page.waitForTimeout(300);
        }

        expect(videoIframeVisible!).toBeTruthy();
    }


    async verifyThatVideoContainerVisible(){
        let isVisible: boolean;
        for(let i = 0; i < 60; i++){
            isVisible = await this.videoContainer.isVisible();
            if(isVisible){
                break;
            }
            await this.page.waitForTimeout(300);
        }

        expect(isVisible!).toBeTruthy();
    }
}