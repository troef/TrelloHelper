var tep = new TrelloExportPopup();

var tui = new TrelloUI({
        dispatchListsReady: true
    });

chrome.extension.sendMessage({}, function (response) {});
document.addEventListener('trelloui-listsready', function() {
    insertZoomButtons();
    insertEisenhowerButton();

    var popover = $(".pop-over");
    tep.init();

    $('.list-header-menu-icon').click(function (event) {
        var popover_summoned_interval = setInterval(function () {
            if ($(popover).is(':visible')) {
                clearInterval(popover_summoned_interval);
                $(".pop-over .content").append('<hr><ul class="pop-over-list"> <li><a class="js-export-list" href="#">Export This List</a></li> </ul>');
                $(".js-export-list").click(function (e) {
                    exportList(event);
                });
            }
        }, 50);
    });
});

function insertZoomButtons() {
    $('.list-header-name').append('<a href="javascript:void(0)" class="btn-zoom-list"><div class="icon trelloext-icon-arrows-expand"></div></a>');
    $('.btn-zoom-list').click(function(e) {
        toggleZoom($(this).closest('.list'));
    });
}
function insertEisenhowerButton() {
    $('<a id="toggle_eisenhower" class="board-header-btn eisenhower-btn" href="#" title="Toggle Eisenhower Qaudrant view."><span class="board-header-btn-icon icon-sm icon trelloext-icon-thumbnails-large"></span><span class="board-header-btn-text">Eisenhower</span></a>').insertAfter('#permission-level');
    $('#toggle_eisenhower').click(function(e) {
        $('#board').toggleClass('eisenhower');
    });
}

function toggleZoom(current_list) {
        if( $(current_list).hasClass('fullscreen') ) {
            $(current_list).removeClass('fullscreen');
            $('.list').show();
        } else {
            $('.list').not($(current_list)).hide();
            $(current_list).addClass('fullscreen');
        }
}

function exportList(event) {
    tep.hide();
    var first_card_id = findFirstCardId(event);
    if (!first_card_id) {
        alert('No cards found in the list.');
        return false;
    }

    chrome.extension.sendMessage({
        command: 'getCardListId',
        id: first_card_id
    }, function (data) {
        if (data.idList !== undefined) {
            chrome.extension.sendMessage({
                command: 'getListCards',
                id: data.idList
            }, function (data) {
                tep.show(data);
            });
        }
    });
}


/**
 * Uses the menu button on a card to find the first card in that list and get its ID
 * Returns false if not found, or the ID if there is a card
 * @param event
 * @returns bool | string
 */
function findFirstCardId(event) {
    var titles = $(event.currentTarget).parent().parent().find('a.list-card-title:first');
    if (titles[0] === undefined) {
        console.error('List has no cards!');
        return false;
    } else {
        return $(titles[0]).attr('href').split('/')[2];
    }
}