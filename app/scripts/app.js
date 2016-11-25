'use strict';

angular.module('todoApp', ['ui.router','ngResource','ngDialog'])
.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
           // route for the home page
           .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/lists.html',
                        controller  : 'ToDoListController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
						controller  : 'FooterController'
                    }
                }
            })
		
			// route for the todo list entry detail page
            .state('app.listdetail', {
                url: 'listdetail/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/listdetail.html',
                        controller  : 'ToDoListDetailController'
                   }
                }
            })
		
			// route for creating a new todo list entry
            .state('app.listcreate', {
                url: 'listcreate',
                views: {
                    'content@': {
                        templateUrl : 'views/listdetail.html',
                        controller  : 'ToDoListCreationController'
                   }
                }
            })
		
			// route for showing the list of Todo items of a list.
            .state('app.listtodoitems', {
                url: 'listitems/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/listtodoitems.html',
                        controller  : 'ToDoItemListController'
                   }
                }
            })
		
			// route for the todo item detail page
            .state('app.todoitemdetail', {
                url: 'todoitemdetail/:id',
                views: {
                    'content@': {
                        templateUrl : 'views/todoitemdetail.html',
                        controller  : 'ToDoItemDetailController'
                   }
                }
            })
		
			// route for creating a new todo item entry for the given list
            .state('app.todoitemcreate', {
                url: 'todoitemcreate/:id',
			    views: {
                    'content@': {
                        templateUrl : 'views/todoitemdetail.html',
                        controller  : 'ToDoItemCreationController'
                   }
                }
            });
        

    
        $urlRouterProvider.otherwise('/');
    })
;
