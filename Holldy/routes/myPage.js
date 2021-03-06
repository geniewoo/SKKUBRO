var express = require('express');
var fs = require('fs');
var router = express.Router();
var visitorsController = require('./visitorsController.js');
var session = require('./session.js');
var clientDao = require('./clientDao.js');
var crypto = require('./crypto.js');

router.get('/', function(req, res, next) {
    session.loginStatus(req.session, function(result) {
        if (result === 0) {
            res.redirect('/main?isNeedLogin=true');
        } else if (result === 1 || result === 2) {
            visitorsController.countUpVisitors(req, res, '/myPage', function(result) {
                if (result === true) {
                    fs.readFile('views/myPage.html', function(error, data) {
                        res.send(data.toString());
                    });
                } else {
                    res.send({
                        code: 0,
                        err_msg: 'visitor error'
                    });
                }

            });
        }
    });
});
router.get('/changeClientInfo', function(req, res, next) {
    session.loginStatus(req.session, function(result) {
        if (result === 0) {
            res.redirect('/main?isNeedLogin=true');
        } else if (result === 1 || result === 2) {
            fs.readFile('views/changeClientInfo.html', function(error, data) {
                res.send(data.toString());
            });
        }
    });
});
router.get('/changeClientInfo/get_ClientInfo', function(req, res, next) {
    session.loginStatus(req.session, function(result) {
        if (result === 0) {
            res.redirect('/main?isNeedLogin=true');
        } else if (result === 1 || result === 2) {
            clientDao.findAClient({
                _id: req.session.localLogin.local_ID
            }, {}, function(data) {
                if (data) {
                    res.json({
                        code: result,
                        data: {
                            phoneNum: data.phoneNum,
                            email: data.email,
                            address: data.address
                        }
                    });
                } else {
                    res.json({
                        code: 0,
                        err_msg: 'can not find Client'
                    });
                }
            });
        }
    });
});
router.post('/changeClientInfo/post_changeClientInfo', function(req, res, next) {
    session.loginStatus(req.session, function(result) {
        if (result === 0) {
            res.redirect('/main?isNeedLogin=true');
        } else if (result === 1 || result === 2) {
            var updateInfo = req.body;
            if (JSON.stringify(updateInfo) === '{}') { //빈 제이슨
                res.json({
                    code: 1
                });
                return;
            }
            if (updateInfo.password) {
                updateInfo.hPassword = crypto.getCrypto(updateInfo.password);
                delete updateInfo.password;
            }
            clientDao.updateClient({
                _id: req.session.localLogin.local_ID
            }, updateInfo, function(result) {
                if (result) {
                    if(updateInfo.hPassword){
                    req.session.localLogin.local_password = updateInfo.hPassword;
                    }
                    res.json({
                        code: 1
                    });
                } else {
                    res.json({
                        code: 0,
                        err_msg: "update err"
                    });
                }
            });
        }
    });
});
module.exports = router;
