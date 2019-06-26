
/**
 * This is the search module.
 * You can assign a search function as a real time filter to a text input field to filter a set of elements by their text content.
 * 
 * This search module also works with the pagination module.
 * Whenever a search term is entered, the pagination is disabled and hidden.
 * As soon as the search field is empty again, the pagination is being re-activated.
 * 
 */
let MadSearchModule = function () {

    /**
     * Assign the search function to a text input field.
     * Search event will be triggered on key-up
     * @param {*jQuery Dom element} searchInput 
     */
    this.initSearchListKeyEvent = function (searchInput) {
        $('body').on('keyup', searchInput, function (e) {
            generalSearchFunction($(this), null);
        });
    };


    /**
     * This is the general search function which be executed with a given search input field.
     * Aslo a reference to a pagination object can optionally be specified.
     * @param {any} searchField
     */
    this.generalSearchFunction = function (searchField, pagination = null) {
        let listElements = null;
        let searchTerm = searchField.val().toLowerCase();
        let targetId = searchField.attr('for');
        let targetListWrapper = $(targetId);
        // use the "default" elements specified in the HTML if no pagination is defined
        if (!pagination) {
            let targetElementClass = searchField.attr('target-list-element');
            if (!targetElementClass)
                listElements = targetListWrapper.find('.feed-element');
            else
                listElements = targetListWrapper.find(targetElementClass);
        }
        // otherwise we search in the elements of the pagination  
        else {
            listElements = pagination.convertToSingleArray();
            // if the search field is empty, we must display and restore the pagination 
            if (searchTerm.length <= 0) {
                pagination.restorePagination();
            }
            // otherwise we simply hide the entire pagination navigation
            else {
                pagination.hidePaginationRow();
                pagination.showAllChildren();
            }
        }
        // check each of the elements if it matches the search string. Hide or show them accordingly...
        $.each(listElements, function (k, v) {
            v = $(v);
            let content = "";
            let formElements = $('input, select, textarea', v);
            if (formElements.length <= 0) {
                content = v.text().toLowerCase();
            }
            else {
                $.each(formElements, function (k1, v1) {
                    content += $(v1).val();
                });
            }
            content = content.toLowerCase();
            if (content.indexOf(searchTerm) > -1) {
                v.show();
            }
            else {
                v.hide();
            }
        });
    };


    /**
     * This function can be used to manually assign a search function to a text field
     * when pagination is enabled.
     * @param {any} searchField
     * @param {any} pagination
     */
    this.assignSearchFunctionForPagination = function (searchField, pagination) {
        let scope = this;
        searchField.on('keyup', function (e) {
            scope.generalSearchFunction($(this), pagination);
        });
    };

}
