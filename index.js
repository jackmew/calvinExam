/*
*   ZestHo 2017-05-04
*   Libreary: jQury, Bootstap.
*   1. Fetch a JSON data from the server
*   2. Contruct Input(For Filter), Table(With Sorter), Pagination
*   3. Filter can filter two dimension: {company: {name}}
*   4. Sorter can sort two dimension: {company: {name}}. You can change pagination.limit to the one page you want.
*   5. The sorter and pagination is based on the data, So if criteria of the filter change, I will call reset() first.
*/
// get specific attributes to show on table
var colNames = ["id", "name", "email", "website", "company-name"];
var dataOriginal = [];
var dataNew = [];
// pagination attributes
var pagination = {
    limit: 5 , // You can change limit for one page you want.
    page: 1,
    pages: 0,
    offset: 0,
    total: 0
} ;

function createSearchCriteria() {
    var $container = $(".container");
    var $input = $("<input type='text' id='inputCriteria' placeholder='Criteria' />");
    $container.append($input);
    filterEvent($input);
}
function filterEvent($input) {
    $input.keyup(function() {
        var criteria = this.value;
        filter(criteria);
    });
}
function reset() {
    dataNew = [];
    // reset table
    $span = $("th").find("span");
    $span.removeClass("glyphicon-triangle-top");
    $span.addClass("glyphicon-triangle-bottom");
    // reset pagination
    pagination.page = 1 ;
}
function filter(criteria) {
    reset();
    dataOriginal.forEach(function(data) {
        var isMatch = colNames.some(function(colName) {
            var value ;
            if(colName.indexOf("-") > -1) {
                var twoNames = colName.split("-");
                value = data[twoNames[0]][twoNames[1]];
            } else {
                value = data[colName] ;
            }
            if(typeof value === "number") {
                value = value.toString();
            }
            return value.indexOf(criteria) > -1;
        });
        if(isMatch) {
            dataNew.push(data);
        }
    });
    renderPagination();
    renderTable();
}
function sort($th) {
    $th.click(function() {
        var valueSort = $(this).text();

        var $span = $th.find("span");
        changeSortDirection($span);

        if(!dataNew.length) {
            dataNew = dataOriginal.slice();
        }

        dataNew.sort(function(item1, item2) {
            var item1Value = item1[valueSort];
            var item2Value = item2[valueSort];
            // company-name will be undefined
            if(!item1Value) {
                var objArr = valueSort.split("-");
                item1Value = item1[objArr[0]][objArr[1]];
                item2Value = item2[objArr[0]][objArr[1]];
            }
            // descending
            if($span.hasClass('glyphicon-triangle-bottom')) {
                if(typeof item1Value === "number") {
                    return item1Value - item2Value;
                } else if(typeof item1Value === "string") {
                    return item1Value.localeCompare(item2Value);
                }
            // ascending
            } else {
                if(typeof item1Value === "number") {
                    return item2Value - item1Value;
                } else if(typeof item1Value === "string") {
                    return item2Value.localeCompare(item1Value);
                }
            }

        });

        renderTable();
    });
}

function changeSortDirection($span) {
    if($span.hasClass('glyphicon-triangle-bottom')) {
        $span.removeClass('glyphicon-triangle-bottom');
        $span.addClass('glyphicon-triangle-top');
    } else {
        $span.removeClass('glyphicon-triangle-top');
        $span.addClass('glyphicon-triangle-bottom');
    }
}
function createTable() {
    var $container = $(".container");
    var $table = $("<table class='table table-striped table-bordered table-hover table-condensed'/>");
    // create thead and th(table header)
    var $thead = $("<thead/>");
    colNames.forEach(function(colName) {
        var $th = $("<th/>").text(colName);
        $th.append("<span class='glyphicon glyphicon-triangle-bottom' style='padding-left:5px;'></span>");
        sort($th);
        $thead.append($th);
    });
    $table.append($thead);
    // attach table
    var $tbody = $("<tbody/>");
    $table.append($tbody);
    $container.append($table);
}
function createPagination() {

    var $pageWrapper = $("<div class='text-center'/>");
    var $pagination = $("<ul class='pagination' style='display: inline-block'/>");

    var $previous = $(`<li name='previous'>
                        <a href='#' value='previous'>«</a>
                      </li>`);
    $pagination.append($previous);

    var $next = $(`<li name='next'>
                    <a href='#' value='next'>»</a>
                  </li>`);

    $pagination.append($next);

    $pageWrapper.append($pagination);
    $(".container").append($pageWrapper);
}
function renderPagination() {
    // remove pageNumbers
    $("li[name='pageNumber']").remove();

    if(dataNew.length) {
        pagination.total = dataNew.length;
    } else {
        pagination.total = dataOriginal.length;
    }
    pagination.pages = Math.ceil(pagination.total/pagination.limit);
    pagination.offset = pagination.limit * (pagination.page - 1);

    for(var i = 0; i < pagination.pages; i++) {
        var $pageNumber
        if(i === 0) {
            $pageNumber = $(`<li name="pageNumber" class="active"><a href="#" value="${i+1}">${i+1}</a></li>`);
        } else {
            $pageNumber = $(`<li name="pageNumber"><a href="#" value="${i+1}">${i+1}</a></li>`);
        }

        $pageNumber.insertBefore("li[name='next']");
    }
    paginationEvent();
}
function paginationEvent() {
    var $pagination = $(".pagination a");
    $pagination.off();
    $pagination.click(function() {
        var oldPage = parseInt($('.pagination li.active').find("a").attr("value"));

        var newPage = $(this).attr("value");

        if(newPage === "previous") {
            if(oldPage === 1) {
                return; // do nothing
            } else {
                $('.pagination li.active').removeClass("active");
                $(`.pagination li a[value='${oldPage-1}']`).closest("li").addClass("active");
            }
        } else if(newPage === "next") {
            if(oldPage === pagination.pages) {
                return; // do nothing
            } else {
                $('.pagination li.active').removeClass("active");
                $(`.pagination li a[value='${oldPage+1}']`).closest("li").addClass("active");
            }
        } else {
            $('.pagination li.active').removeClass("active");
            $(this).closest("li").addClass("active");
        }
        page();
    });
}
function page() {
    pagination.page = $('.pagination li.active a').attr("value");
    renderTable();
}
function renderTable() {
    pagination.offset = pagination.limit * (pagination.page - 1);
    if(dataNew.length) {
        users = dataNew;
    } else {
        users = dataOriginal;
    }
    // remove children
    var $tbody = $("tbody");
    $tbody.empty();

    // create tbody and td(table data)
    for(var i = pagination.offset; i < (pagination.offset+pagination.limit); i++) {
        var user = users[i]
        if(!user) {
            break;
        }
        var $tr = $("<tr/>");
        colNames.forEach(function(colName) {
            var value ;
            if(colName.indexOf("-") > -1) {
                var twoNames = colName.split("-");
                value = user[twoNames[0]][twoNames[1]];
            } else {
                value = user[colName] ;
            }
            var $td = $("<td/>").text(value);
            $tr.append($td);
            $tbody.append($tr);
        });
    }
}
$(function() {
    console.log("ready");

    var root = 'https://jsonplaceholder.typicode.com';
    var data ;
    $.ajax({
      url: root + '/users',
      method: 'GET'
    }).done(function(data) {
        console.log(data);
        dataOriginal = data ;
        // follow the order with view
        createSearchCriteria();
        createTable();
        createPagination();
        // Table needs pagination attributes
        renderPagination();
        renderTable();
    }).fail(function(xhr, status, message) {
        alert('error');
    });
});
