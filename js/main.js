var draggedEventIsAllDay;
var activeInactiveWeekends = true;

function getDisplayEventDate(event) {

    var displayEventDate;

    if (event.allDay == false) {
        var startTimeEventInfo = moment(event.start).format('HH:mm');
        var endTimeEventInfo = moment(event.end).format('HH:mm');
        displayEventDate = startTimeEventInfo + " - " + endTimeEventInfo;
    } else {
        displayEventDate = "하루종일";
    }

    return displayEventDate;
}

function filtering(event) {
    var show_type = true;

    var types = $('input:checkbox.filter:checked').map(function () {
        return $(this).val();
    }).get();

    if (types && types.length > 0) {
        if (types[0] === "all") {
            show_type = true;
        } else {
            show_type = types.indexOf(event.type) >= 0;
        }
    }

    return show_type;
}

function calDateWhenResize(event) {

    var newDates = {
        startDate: '',
        endDate: ''
    };

    if (event.allDay) {
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD');
        newDates.endDate = moment(event.end._d).subtract(1, 'days').format('YYYY-MM-DD');
    } else {
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD HH:mm');
        newDates.endDate = moment(event.end._d).format('YYYY-MM-DD HH:mm');
    }

    return newDates;
}

function calDateWhenDragnDrop(event) {
    // 드랍시 수정된 날짜반영
    var newDates = {
        startDate: '',
        endDate: ''
    }

    // 날짜 & 시간이 모두 같은 경우
    if (!event.end) {
        event.end = event.start;
    }

    //하루짜리 all day
    if (event.allDay && event.end === event.start) {
        console.log('1111')
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD');
        newDates.endDate = newDates.startDate;
    }

    //2일이상 all day
    else if (event.allDay && event.end !== null) {
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD');
        newDates.endDate = moment(event.end._d).subtract(1, 'days').format('YYYY-MM-DD');
    }

    //all day가 아님
    else if (!event.allDay) {
        newDates.startDate = moment(event.start._d).format('YYYY-MM-DD HH:mm');
        newDates.endDate = moment(event.end._d).format('YYYY-MM-DD HH:mm');
    }

    return newDates;
}

/////////////////////////////////////////////////
// test repeat Begin
var defaultEvents = [
    {
        // Just an event
        title: 'Long Event',
        start: '2020-08-07',
        end: '2020-08-10',
        className: 'scheduler_basic_event'
    },
    {
        // Custom repeating event
        id: 999,
        title: 'Repeating Event',
        start: '2020-08-09T16:00:00',
        className: 'scheduler_basic_event'
    },
    {
        // Custom repeating event
        id: 999,
        title: 'Repeating Event',
        start: '2020-08-16T16:00:00',
        className: 'scheduler_basic_event'
    },
    {
        // Just an event
        title: 'Lunch',
        start: '2020-08-12T12:00:00',
        className: 'scheduler_basic_event',
    },
    {
        // Just an event
        title: 'Happy Hour',
        start: '2020-08-12T17:30:00',
        className: 'scheduler_basic_event'
    },
    {
        // Monthly event
        id: 111,
        title: 'Meeting',
        start: '2000-01-01T00:00:00',
        className: 'scheduler_basic_event',
        repeat: 1
    },
    {
        // Annual avent
        id: 222,
        title: 'Birthday Party',
        start: '2020-08-04T07:00:00',
        description: 'This is a cool event',
        className: 'scheduler_basic_event',
        repeat: 2
    },
    {
        // Weekday event
        title: 'Click for Google',
        url: 'http://google.com/',
        start: '2020-08-28',
        className: 'scheduler_basic_event',
        dow: [1, 5]
    }
];
// Any value represanting monthly repeat flag
var REPEAT_MONTHLY = 1;
// Any value represanting yearly repeat flag
var REPEAT_YEARLY = 2;
// test repeat End
/////////////////////////////////////////////////

var calendar = $('#calendar').fullCalendar({

    eventRender: function (event, element, view) {

        //일정에 hover시 요약
        element.popover({
            title: $('<div />', {
                class: 'popoverTitleCalendar',
                text: event.title
            }).css({
                'background': event.backgroundColor,
                'color': event.textColor
            }),
            content: $('<div />', {
                class: 'popoverInfoCalendar'
            }).append('<p><strong>등록자:</strong> ' + event.username + '</p>')
                .append('<p><strong>일정 구분:</strong> ' + event.type + '</p>')
                .append('<p><strong>장소:</strong> ' + event.place + '</p>')
                .append('<p><strong>일시:</strong> ' + getDisplayEventDate(event) + '</p>')
                .append('<div class="popoverDescCalendar"><strong>내용:</strong> ' + event.description + '</div>'),
            delay: {
                show: "800",
                hide: "50"
            },
            trigger: 'hover',
            placement: 'top',
            html: true,
            container: 'body'
        });

        return filtering(event);

    },

    //주말 숨기기 & 보이기 버튼
    customButtons: {
        viewWeekends: {
            text: '주말',
            click: function () {
                activeInactiveWeekends ? activeInactiveWeekends = false : activeInactiveWeekends = true;
                $('#calendar').fullCalendar('option', {
                    weekends: activeInactiveWeekends
                });
            }
        }
    },

    header: {
        left: 'today, prevYear, nextYear, viewWeekends',
        center: 'prev, title, next',
        right: 'month,agendaWeek,agendaDay,listWeek'
    },
    views: {
        month: {
            columnFormat: 'dddd'
        },
        agendaWeek: {
            columnFormat: 'M/D ddd',
            titleFormat: 'YYYY년 M월 D일',
            eventLimit: false
        },
        agendaDay: {
            columnFormat: 'dddd',
            eventLimit: false
        },
        listWeek: {
            columnFormat: ''
        }
    },

    /* ****************
     *  일정 받아옴
     * ************** */
    events: function (start, end, timezone, callback) {
        $.ajax({
            type: "get",
            url: "data.json",
            data: {
                // 실제 사용시, 날짜를 전달해 일정기간 데이터만 받아오기를 권장
            },
            success: function (response) {
                var fixedDate = response.map(function (array) {
                    if (array.allDay && array.start !== array.end) {
                        // 이틀 이상 AllDay 일정인 경우 달력에 표기시 하루를 더해야 정상출력
                        array.end = moment(array.end).add(1, 'days');
                    }
                    return array;
                })
                callback(fixedDate);
            }
        });
    },

    eventAfterAllRender: function (view) {
        if (view.name === "month") {
            $(".fc-content").css('height', 'auto');
        }
    },

    //일정 리사이즈
    eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
        $('.popover.fade.top').remove();

        /** 리사이즈시 수정된 날짜반영
         * 하루를 빼야 정상적으로 반영됨. */
        var newDates = calDateWhenResize(event);

        //리사이즈한 일정 업데이트
        $.ajax({
            type: "get",
            url: "",
            data: {
                //id: event._id,
                //....
            },
            success: function (response) {
                alert('수정: ' + newDates.startDate + ' ~ ' + newDates.endDate);
            }
        });

    },

    eventDragStart: function (event, jsEvent, ui, view) {
        draggedEventIsAllDay = event.allDay;
    },

    //일정 드래그앤드롭
    eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
        $('.popover.fade.top').remove();

        //주,일 view일때 종일 <-> 시간 변경불가
        if (view.type === 'agendaWeek' || view.type === 'agendaDay') {
            if (draggedEventIsAllDay !== event.allDay) {
                alert('드래그앤드롭으로 종일<->시간 변경은 불가합니다.');
                location.reload();
                return false;
            }
        }

        // 드랍시 수정된 날짜반영
        var newDates = calDateWhenDragnDrop(event);

        //드롭한 일정 업데이트
        $.ajax({
            type: "get",
            url: "",
            data: {
                //...
            },
            success: function (response) {
                alert('수정: ' + newDates.startDate + ' ~ ' + newDates.endDate);
            }
        });

    },

    select: function (startDate, endDate, jsEvent, view) {

        $(".fc-body").unbind('click');
        $(".fc-body").on('click', 'td', function (e) {

            $("#contextMenu")
                .addClass("contextOpened")
                .css({
                    display: "block",
                    left: e.pageX,
                    top: e.pageY
                });
            return false;
        });

        var today = moment();

        if (view.name === "month") {
            startDate.set({
                hours: today.hours(),
                minute: today.minutes()
            });
            startDate = moment(startDate).format('YYYY-MM-DD HH:mm');
            endDate = moment(endDate).subtract(1, 'days');

            endDate.set({
                hours: today.hours() + 1,
                minute: today.minutes()
            });
            endDate = moment(endDate).format('YYYY-MM-DD HH:mm');
        } else {
            startDate = moment(startDate).format('YYYY-MM-DD HH:mm');
            endDate = moment(endDate).format('YYYY-MM-DD HH:mm');
        }

        //날짜 클릭시 카테고리 선택메뉴
        var $contextMenu = $("#contextMenu");
        $contextMenu.on("click", "a", function (e) {
            e.preventDefault();

            //닫기 버튼이 아닐때
            if ($(this).data().role !== 'close') {
                newEvent(startDate, endDate, $(this).html());
            }

            $contextMenu.removeClass("contextOpened");
            $contextMenu.hide();
        });

        $('body').on('click', function () {
            $contextMenu.removeClass("contextOpened");
            $contextMenu.hide();
        });

    },

    //이벤트 클릭시 수정이벤트
    eventClick: function (event, jsEvent, view) {
        editEvent(event);
    },

    ////////////////////////////////////////////////////////////////////////////
    // repeat test
    eventSources: [defaultEvents],
    dayRender: function (date, cell) {
        // Get all events
        var events = $('#calendar').fullCalendar('clientEvents').length ? $('#calendar').fullCalendar('clientEvents') : defaultEvents;

        // Start of a day timestamp
        var dateTimestamp = date.hour(0).minutes(0);
        var recurringEvents = [];

        // find all events with monthly repeating flag, having id, repeating at that day few months ago
        var monthlyEvents = events.filter(function (event) {
            return event.repeat === REPEAT_MONTHLY &&
                event.id &&
                moment(event.start).hour(0).minutes(0).diff(dateTimestamp, 'months', true) % 1 == 0
        });

        // find all events with monthly repeating flag, having id, repeating at that day few years ago
        var yearlyEvents = events.filter(function (event) {
            return event.repeat === REPEAT_YEARLY &&
                event.id &&
                moment(event.start).hour(0).minutes(0).diff(dateTimestamp, 'years', true) % 1 == 0
        });

        recurringEvents = monthlyEvents.concat(yearlyEvents);

        $.each(recurringEvents, function (key, event) {
            var timeStart = moment(event.start);

            // Refething event fields for event rendering
            var eventData = {
                id: event.id,
                allDay: event.allDay,
                title: event.title,
                description: event.description,
                start: date.hour(timeStart.hour()).minutes(timeStart.minutes()).format("YYYY-MM-DD"),
                end: event.end ? event.end.format("YYYY-MM-DD") : "",
                url: event.url,
                className: 'scheduler_basic_event',
                repeat: event.repeat
            };

            // Removing events to avoid duplication
            $('#calendar').fullCalendar('removeEvents', function (event) {
                return eventData.id === event.id &&
                    moment(event.start).isSame(date, 'day');
            });

            // Render event
            $('#calendar').fullCalendar('renderEvent', eventData, true);
        });
    },
    // repeat test
    ////////////////////////////////////////////////////////////////////////////


    locale: 'ko',
    timezone: "local",
    nextDayThreshold: "09:00:00",
    allDaySlot: true,
    displayEventTime: true,
    displayEventEnd: true,
    firstDay: 0, //월요일이 먼저 오게 하려면 1
    weekNumbers: false,
    selectable: true,
    weekNumberCalculation: "ISO",
    eventLimit: true,
    views: {
        month: {
            eventLimit: 12
        }
    },
    eventLimitClick: 'week', //popover
    navLinks: true,
    // defaultDate: moment('2020-07'), //실제 사용시 삭제
    timeFormat: 'HH:mm',
    defaultTimedEventDuration: '01:00:00',
    editable: true,
    minTime: '00:00:00',
    maxTime: '24:00:00',
    slotLabelFormat: 'HH:mm',
    weekends: true,
    nowIndicator: true,
    dayPopoverFormat: 'MM/DD dddd',
    longPressDelay: 0,
    eventLongPressDelay: 0,
    selectLongPressDelay: 0
});
