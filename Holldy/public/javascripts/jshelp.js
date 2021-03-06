$(function() {
    $chatContent = $('#chatContent');
    $chatTextArea = $('#chatTextArea');
    $chatSendBtn = $('#chatSendBtn');
    $chatForm = $('#chatForm');
    resizeWindow($chatContent, $chatForm, $chatSendBtn, $chatTextArea);

    initHelpWindow($chatContent, $chatSendBtn, $chatTextArea);
    var socket = io.connect();
    var roomName = '';
    socket.emit('help_request');
    $chatTextArea.on('keydown', function(event) {
        if (event.keyCode == 13) {
            $chatSendBtn.trigger('click');
        }
    });
    $chatSendBtn.on('click', function() { //전송 클릭하면 메세지 보냄
        var msg = $chatTextArea.val();
        $chatTextArea.val('');

        socket.emit('help_send_msg', {
            'msg': msg,
            'roomName': roomName,
            'isClient': true
        });
    });
    socket.on('help_reply', function(myID) {
        roomName = myID;
        socket.emit('join', myID);
        resetHelpWindow($chatContent, $chatSendBtn, $chatTextArea);
    });
    socket.on('help_get_msg', function(data) {
        var msg = data.msg;
        var text;
        var isClient = data.isClient;
        if(msg.startsWith('close')){
            text = makeOthersText(msg.substring(5), isClient);
            $chatSendBtn.attr('disabled', 'disabled');
            $chatTextArea.attr('disabled', 'disabled');
            $chatContent.css('background-color', '#bbb');
        }else{
            text = makeOthersText(msg, isClient);
        }
        $chatContent.append(text);
        $chatContent.scrollTop($chatContent.prop("scrollHeight"));
    });
});

var makeOthersText = function(msg, isClient) {
    var text = '';
    var classStr;
    if (isClient) {
        classStr = 'client';
    } else {
        classStr = 'admin';
    }
    text += '<p class="' + classStr + '">' + msg + '</p>';
    return text;
}

var initHelpWindow = function($chatContent, $chatSendBtn, $chatTextArea) {
    var text = '<p class="admin">죄송합니다 관리자가 현재 접속해 있지 않습니다.</p>';
    $chatContent.html(text);
    $chatSendBtn.attr('disabled', 'disabled');
    $chatTextArea.attr('disabled', 'disabled');
    $chatContent.css('background-color', '#bbb');
}

var resetHelpWindow = function($chatContent, $chatSendBtn, $chatTextArea) {
    var text = '<p class="admin">관리자가 실시간 답변이 가능합니다.</p>';
    $chatSendBtn.removeAttr('disabled');
    $chatTextArea.removeAttr('disabled');
    $chatContent.html(text);
    $chatContent.css('background-color', '#fff');
}

var resizeWindow = function($chatContent, $chatForm, $chatSendBtn, $chatTextArea) {
    $(window).on('resize', function() {
        var height = $(window).innerHeight();
        var width = $(window).innerWidth();
        $chatContent.height(height - 120);
        $('#chatTitle').css('padding-left', width / 2 - 25);
        $('#chatTextArea').css('width', width - 75);
    });
    $(window).trigger('resize');
}
