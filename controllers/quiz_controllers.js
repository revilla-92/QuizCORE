var models = require('../models/models.js');

// Autoload
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
			where: { id: Number(quizId)},
			include: [{model: models.Comment }]
		}).then(
		function(quiz) {
			if(quiz){
				req.quiz = quiz;
				next();
			}else{ next(new Error('No existe quizId='+quizId));
			}
		}
	).catch(function(error){next(error);});
};

// PUT /quizes/:id

exports.update = function(req,res){

	if(req.files.image){
		req.body.quiz.image = req.files.image.name;
	}

	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err){
			if(err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			}else{
				req.quiz
				.save( {fields: ["pregunta", "respuesta", "image"]})
				.then( function(){ res.redirect('/quizes');});
			}
		}
		);
};

// DELETE /quizes/:id

exports.destroy = function(req,res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};
 
// GET /quizes

exports.index = function(req,res){
	var options = {};
	var marcado = [];
	var favoritos = [];

	if(req.user){
    	options.where = {UserId: req.user.id}
  	};
  	if(req.session.user){
  		models.Favourites.findAll({ where: { UserId: Number(req.session.user.id) }})
	.then(function(f) {
	  favoritos = f;
	  if (req.query.search === undefined) {
		models.Quiz.findAll(options).then(function(quizes) {
		for (j in quizes) {
		  marcado[j] = "0";
		  for (k in favoritos) {
			if (favoritos[k].QuizId === quizes[j].id) {marcado[j] = "1";}
		  }
		}
		res.render('quizes/index', { quizes: quizes, marcado: marcado, errors: []});
		}).catch(function(error) { next(error);});
	  } else {
		cadena = '%'+req.query.search+'%';
		cadena = cadena.replace(/ /g, '%');
		models.Quiz.findAll({where: ["pregunta like ?", cadena], order: ['pregunta']})
		.then(function(quizes) {
		for (j in quizes) {
		  marcado[j] = "0";
		  for (k in favoritos) {
			if (favoritos[k].QuizId === quizes[j].id) {marcado[j] = "1";}
		  }
		}
		res.render('quizes/index', { quizes: quizes, marcado: marcado, errors: []});
		}).catch(function(error) { next(error);});
	  }
	});
	}else{
		if (req.query.search === undefined) {
		models.Quiz.findAll(options).then(function(quizes) {
		
		res.render('quizes/index', { quizes: quizes, marcado: marcado, errors: []});
		}).catch(function(error) { next(error);});
	  } else {
		cadena = '%'+req.query.search+'%';
		cadena = cadena.replace(/ /g, '%');
		models.Quiz.findAll({where: ["pregunta like ?", cadena], order: ['pregunta']})
		.then(function(quizes) {
		res.render('quizes/index', { quizes: quizes, marcado: marcado, errors: []});
		}).catch(function(error) { next(error);});
	  }
	}
	
		
};

// GET /quizes/new

exports.new = function(req,res){
	var quiz = models.Quiz.build(
		{pregunta : "Pregunta", respuesta : "Respuesta"}
		);

	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create

exports.create = function(req, res){
	req.body.quiz.UserId = req.session.user.id;
	if(req.files.image){
		req.body.quiz.image = req.files.image.name;
	}

	var quiz = models.Quiz.build( req.body.quiz );

	quiz
	.validate()
	.then(function(err){
		if(err){
			res.render('quizes/new', {quiz: quiz, errors: err.errors});
		}else{
			quiz
			.save({fields: ["pregunta", "respuesta","UserId", "image"]})
			.then(function(){
				res.redirect('/quizes')})
		}
	});
};

// GET /quizes/:id/edit

exports.edit = function(req,res){
	var quiz = req.quiz;
	res.render('quizes/edit', {quiz: quiz, errors: []});
}

// GET /quizes/show

exports.show = function(req,res){
	var favorito = 0;
	models.Quiz.find(req.params.quizId).then(function(quiz){
		if(req.session.user){
		models.Favourites.findAll({ where: { UserId: Number(req.session.user.id) }})
			.then(function(f) {
		  for (k in f) {
			if (f[k].QuizId === quiz.id) {favorito = 1;}
		  }
		
			res.render('quizes/show', {quiz: req.quiz, favorito: favorito, errors: []});
		})
		}else{
			res.render('quizes/show', {quiz: req.quiz, favorito: favorito, errors: []});
		}
	})
};

// GET /quizes/answer
exports.answer = function(req,res){
	var resultado = 'Incorrecto';	
	if(req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto';
	}
	
	res.render('quizes/answer', {quiz:req.quiz, respuesta:resultado, errors: []});
};

// MW permite acciones solamente si el quiz objeto pertenece al usuario logueado o si es cuenta admin

exports.ownershipRequired = function(req,res,next){
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if(isAdmin || objQuizOwner === logUser){
		next();
	}else{
		res.redirect('/');
	}
};

// GET /quizes/statistics

exports.statistics = function(req,res){

models.Quiz.findAll().then(function(quizes){
		var nPreguntas = quizes.length;
		models.Comment.findAll().then(function(comments){
			var nComentarios = comments.length;
			var media = nComentarios/nPreguntas;
			var sinComments = 0;
			var conComments = 0;
			var i = 0;
			var array=[];
			for(i=0; i<nComentarios; i++){
				if(array[comments[i].QuizId]){
					array[comments[i].QuizId]++;
				}else{
					array[comments[i].QuizId] = 1;
				}
			}
			for(i=0; i<nPreguntas; i++){
				if(array[i]){
					conComments++;
				} else{
					sinComments++;
				}
			}
			res.render('statistics/statistics', {count: nPreguntas, count_c: nComentarios, count_p: media, count_s: sinComments, count_cm: conComments, errors: []});
		}).catch(function(error){next(error);})
	}).catch(function(error){next(error);})

};
