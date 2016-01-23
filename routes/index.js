var express = require('express');
var router = express.Router();
var multer = require('multer');

var quizController = require('../controllers/quiz_controllers');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var favController = require('../controllers/favourites_controller');

var author = require('../controllers/author');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: [] });
});

// Definición de rutas de quizes
router.param('quizId', quizController.load); // autoload :quizId
router.param('commentId', commentController.load); // autoload :commentId
router.param('userId', userController.load);

// Definición de rutas de sesion
router.get('/login', sessionController.auto_logout, sessionController.new);
router.post('/login', sessionController.auto_logout, sessionController.create);
router.get('/logout', sessionController.auto_logout, sessionController.destroy);


// Definición de rutas de quizes
router.get('/quizes', sessionController.auto_logout, quizController.index);
router.get('/quizes/:quizId(\\d+)', sessionController.auto_logout, quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', sessionController.auto_logout, quizController.answer);
router.put('/quizes/:quizId(\\d+)', sessionController.auto_logout, sessionController.loginRequired, userController.ownershipRequired, multer({ dest: './public/media/'}), quizController.update);
router.delete('/quizes/:quizId(\\d+)', sessionController.auto_logout, sessionController.loginRequired, userController.ownershipRequired, quizController.destroy);
router.get('/quizes/:quizId(\\d+)/edit', sessionController.auto_logout, sessionController.loginRequired, userController.ownershipRequired, quizController.edit);
router.get('/quizes/new', sessionController.auto_logout, sessionController.loginRequired, quizController.new);
router.post('/quizes/create', sessionController.auto_logout, sessionController.loginRequired, multer({ dest: './public/media/'}), quizController.create);
router.get('/quizes/statistics', sessionController.auto_logout, sessionController.loginRequired, quizController.statistics);

// Definición de ruta de autor
router.get('/author' , author.author);

router.get('/usuarios', userController.lista_users);

// Definición de rutas de comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', sessionController.auto_logout, commentController.new);
router.post('/quizes/:quizId(\\d+)/comments', sessionController.auto_logout, commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', sessionController.auto_logout, userController.ownershipRequired, sessionController.loginRequired, commentController.publish);

// Definición de rutas de cuenta
router.get('/user',  userController.new);     // formulario sign un
router.post('/user',  userController.create);     // registrar usuario
router.get('/user/:userId(\\d+)/edit',  sessionController.loginRequired, userController.ownershipRequired, userController.edit);     // editar información de cuenta
router.put('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownershipRequired, userController.update);     // actualizar información de cuenta
router.delete('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownershipRequired, userController.destroy);     // borrar cuenta
router.get('/user/:userId(\\d+)/quizes',  quizController.index);     // ver las preguntas de un usuario

// Definición de rutas de usuario
router.get('/user/:userId(\\d+)/favourites',  favController.show);  // ver los favoritos de un usuario
router.put('/user/:userId(\\d+)/favourites/:quizId(\\d+)',  sessionController.loginRequired, favController.update);
router.delete('/user/:userId(\\d+)/favourites/:quizId(\\d+)',  sessionController.loginRequired, favController.destroy);

module.exports = router;
