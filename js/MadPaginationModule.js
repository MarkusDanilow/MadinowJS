"use strict";

/**
 * This module takes care of the pagination stuff.
 * It can generate a pagination for any set of child elements contained in a parent element.
 */
let MadPaginationModule = function () {

    /**
     * This is the content wrapper element, where the child elements are located.
     * The child elements will be spread over several pages, but the content wrapper will stay static.
     */
    this.outterContentWrapper = null;

    /**
     * The identifier, ideally class name, of the child elements that shall be spread on different pages
     */
    this.childElementIdentifier = null;

    /**
     * Maximum number of elements that are displayed per page
     */
    this.maxElementsPerPage = 10;

    /**
     * Number of pages that will be generated
     */
    this.numPages = 0;

    /**
     * The page we are currently on.
     */
    this.currentPageIndex = 0;

    /**
     * Index of the previously selected page
     */
    this.prevPageIndex = 0;

    /**
     * This maps the child element on the different pages they shall be displayed on.
     */
    this.childrenPageMapping = {};

    /**
     * Fix ID of the next button 
     */
    this.nextButtonId = 'mad-pagination-next';

    /**
     * Fix ID of the previous button 
     */
    this.prevButtonId = 'mad-pagination-prev';

    /**
     * ID prefix for the page buttons 
     */
    this.pageButtonPrefId = 'mad-pagination-page-';

    /**
     * Fix ID of the pagination row
     */
    this.paginationRowId = 'mad-pagination-row';

    /**
     * Fix ID of the pagination col 
     */
    this.paginationColId = 'mad-pagination-col';

    /**
     * This method will create a pagination entirely for a wrapper and its child elements
     * @param {any} wrapper
     * @param {any} childIdentifier
     */
    this.createPagination = function (wrapper, childIdentifier) {
        this.outterContentWrapper = wrapper;
        this.childElementIdentifier = childIdentifier;
        let children = this.outterContentWrapper.find(this.childElementIdentifier);
        let div = Math.floor(children.length / this.maxElementsPerPage);
        let mod = children.length % this.maxElementsPerPage;
        this.numPages = div;
        if (mod > 0) {
            this.numPages++;
        }

        let scope = this;

        // generate the pagination UI
        let row = HtmlGenerator.generateDiv(this.outterContentWrapper, this.paginationRowId, 'row mt-3', true);
        let col = HtmlGenerator.generateDiv(row, this.paginationColId, 'col-12 pl-3 ml-3', true);
        let prevBtn = HtmlGenerator.generateButton(col, this.prevButtonId, 'btn btn-default', true, { 'text': 'previous' });
        prevBtn.click(function (e) {
            scope.prevButtonClickEvent($(this), e);
        });

        // slice the arry of children and associate them with their page number 
        // and generate page button on UI accordingly 
        for (let i = 0, pageIndex = 0; i < children.length;
            i += this.maxElementsPerPage, pageIndex++) {
            let upperBound = i + this.maxElementsPerPage;
            if (upperBound >= children.length) {
                upperBound = children.length;
            }
            let currentChildren = children.slice(i, upperBound);
            this.childrenPageMapping[pageIndex] = currentChildren;

            // create page button in UI 
            let btn = HtmlGenerator.generateButton(col,
                this.pageButtonPrefId + pageIndex,
                'btn btn-default',
                true,
                { 'text': pageIndex + 1, 'mad-target-page': pageIndex });
            btn.click(function (e) {
                scope.pageButtonClickEvent($(this), e);
            });
        }

        let nextBtn = HtmlGenerator.generateButton(col, this.nextButtonId, 'btn btn-default', true, { 'text': 'next' });
        nextBtn.click(function (e) {
            scope.nextButtonClickEvent($(this), e);
        });

        // first of all hide all children 
        children.hide();

        // init page indices
        this.currentPageIndex = 0;
        this.prevPageIndex = 0;

        // activate the default start page 
        this.childrenPageMapping[this.currentPageIndex].fadeIn(250);
        this.nextPrevButtonCheck();

    }

    /**
     * This will destroy an existing pagination and remove all pagination buttons 
     */
    this.destroyPagination = function () {
        $('#' + this.paginationRowId).remove();
        this.showAllChildren();
    }

    /**
     * This function will be triggered when the "next" button is pressed
     * @param {any} btn
     * @param {any} e
     */
    this.nextButtonClickEvent = function (btn, e) {
        if (this.currentPageIndex >= this.numPages - 1) return;
        this.currentPageIndex++;
        this.nextPrevButtonCheck();
        this.togglePaginationContent();
        this.prevPageIndex = this.currentPageIndex;
    }

    /**
     * This function will be triggered when the "previous" button is pressed
     * @param {any} btn
     * @param {any} e
     */
    this.prevButtonClickEvent = function (btn, e) {
        if (this.currentPageIndex <= 0) return;
        this.currentPageIndex--;
        this.nextPrevButtonCheck();
        this.togglePaginationContent();
        this.prevPageIndex = this.currentPageIndex;
    }

    /**
     * This function will be triggered when any of the page buttons is pressed
     * @param {any} btn
     * @param {any} e
     */
    this.pageButtonClickEvent = function (btn, e) {
        let selectedPageIndex = btn.attr('mad-target-page');
        let newPageIndex = parseInt(selectedPageIndex);

        // we dont watn the same page to selected two times in a row
        if (this.prevPageIndex === newPageIndex) return;
        this.currentPageIndex = newPageIndex;
        this.nextPrevButtonCheck();
        this.togglePaginationContent();
        this.prevPageIndex = this.currentPageIndex;
    }

    /**
     * Check if the "next" or "previous" button needs to be hidden due to the current page index
     */
    this.nextPrevButtonCheck = function () {
        if (this.currentPageIndex <= 0) {
            $('#' + this.prevButtonId).prop('disabled', true);
        } else {
            $('#' + this.prevButtonId).prop('disabled', false);
        }
        if (this.currentPageIndex >= this.numPages - 1) {
            $('#' + this.nextButtonId).prop('disabled', true);
        } else {
            $('#' + this.nextButtonId).prop('disabled', false);
        }
        // highlight current button of active page
        $('.btn', $('#' + this.paginationRowId)).removeClass('active');
        $('#' + this.pageButtonPrefId + this.currentPageIndex).addClass('active');
    }

    /**
     * Hide the elements of the previous page and show the ones on the page that is currently selected
     */
    this.togglePaginationContent = function () {
        let scope = this;
        let prevElements = scope.childrenPageMapping[scope.prevPageIndex];
        prevElements.animate({ opacity: 0 }, 250, function () {
            prevElements.hide();
        });
        let currentElements = scope.childrenPageMapping[scope.currentPageIndex];
        currentElements.animate({ opacity: 1 }, 250, function () {
            currentElements.show();
        });
    }

    /* ------------------- Extension functions that interact with search functionality ---------------- */

    /**
     * Shows the entire pagination row
     */
    this.showPaginationRow = function () {
        let row = $('#' + this.paginationRowId);
        if (!row.is(':visible')) {
            row.show();
        }
    }

    /**
     * Hides the entire pagination row
     */
    this.hidePaginationRow = function () {
        let row = $('#' + this.paginationRowId);
        if (row.is(':visible')) {
            row.hide();
        }
    }

    /**
     *
     */
    this.showAllChildren = function () {
        $.each(this.convertToSingleArray(), function (k, v) {
            $(v).css('opacity', 1).show();
        });
    }

    /**
     *
     */
    this.hideAllChildren = function () {
        $.each(this.childrenPageMapping, function (k, v) {
            v.hide();
            v.css('opacity', 0);
        });
    }

    /**
     * Converts the entire pagination-child-element-mapping structure to a single 1D array and returns it. 
     */
    this.convertToSingleArray = function () {
        let tmp = Object.values(this.childrenPageMapping);
        let listElements = [];
        for (let i = 0; i < tmp.length; i++) {
            for (let j = 0; j < tmp[i].length; j++) {
                listElements.push(tmp[i][j]);
            }
        }
        return listElements;
    }

    /**
     * This will restore the entire pagination after a search 
     */
    this.restorePagination = function () {
        this.showPaginationRow();
        let currentElements = this.childrenPageMapping[this.currentPageIndex];
        console.log(currentElements);
        currentElements.animate({ opacity: 1 }, 250, function () {
            currentElements.show();
        });
        for (var i = 0; i < this.numPages; i++) {
            if (i === this.currentPageIndex) {
                this.childrenPageMapping[i].animate({ opacity: 1 }, 250, function () {
                    $(this).show();
                });
            } else {
                this.childrenPageMapping[i].animate({ opacity: 0 }, 250, function () {
                    $(this).hide();
                });
            }
        }
    }


}