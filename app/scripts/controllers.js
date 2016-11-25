'use strict';

angular.module('todoApp')

// Controller for managing of all todo lists
.controller('ToDoListController', ['$scope', '$state', 'listFactory', 'listTodoItemsFactory', function ($scope, $state, listFactory, listTodoItemsFactory) {
	
	$scope.showLists = false;
	$scope.message = "Loading ...";
	
	$scope.lists = [];
	
	listFactory.query(
        function (response) {
            var resultList = response;  
			
			var len = resultList.length;	
			for (var i = 0; i < len; i++) {
				var resultEntry = resultList[i];
				var newEntry = {
					"_id":  resultEntry._id,
					"virtual": resultEntry.virtual,
					"name": resultEntry.name,
					"description": resultEntry.description,
					"itemsDue": resultEntry.dueItems					
				}
				$scope.lists.push(newEntry);	
			}			
			$scope.showLists = true;
        },
        function (error) {
            $scope.message = "Error: " + error.status + " " + error.statusText;
        }); 
	
	$scope.addNewTodoList = function() {
  		console.log('Add a new todo list...');	
		$state.go('app.listcreate', {}, {});
	};
	
	$scope.showListTodoItems = function(list) {
  		console.log('Show Todo items of list ' + list.name);	
		$state.go('app.listtodoitems', {id: list._id}, {});
	};
}])

// Controller for detail page of a specific Todo list entry
.controller('ToDoListDetailController', ['$scope', '$state', 'ngDialog', '$stateParams', 'listFactory', function ($scope, $state, ngDialog, $stateParams, listFactory) {

  	$scope.listEntry = {};
    $scope.showListEntry = false;
    $scope.message = "Loading ...";
	
	$scope.isNew = function () {
        return false;
    };
	
    $scope.listEntry = listFactory.get({
            id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $scope.listEntry = response;
                $scope.showListEntry = true;
            },
            function (response) {
                $scope.message = "Error reading listdata: " + response.status + " " + response.statusText;
            }
        );  
	
	$scope.submitListEntryDetail = function () {
  		listFactory.update({id: $stateParams.id}, $scope.listEntry,
			function(response) {
				console.log("Saved list entry with data: " + JSON.stringify(response));				
			}, 
			function(response) {
				console.log("Error saving list entry data: " + response.status + " " + response.statusText);
			}				 
		);
		
		$state.go('app');		
    }
	
	$scope.openConfirmDelete = function () {
		ngDialog.openConfirm({
			template: 'confirmTodoListMessageId',
			className: 'ngdialog-theme-default'
		}).then(function (value) {
			// Delete Todo list
			console.log('Delete Todo list', $scope.listEntry._id);
			listFactory.delete({id: $scope.listEntry._id});
	
			$state.go('app');
		}, function (reason) {
			// Do nothing
		});
	};
}])

// Controller for creating a new Todo list entry
.controller('ToDoListCreationController', ['$scope', '$state', 'listFactory', function ($scope, $state, listFactory) {
	
	$scope.listEntry = {
		name: "",
		description: ""
	};
	
	$scope.isNew = function () {
        return true;
    };
	
	$scope.submitListEntryDetail = function () {
  		listFactory.save($scope.listEntry,
			function(response) {
				console.log("Saved list entry with data: " + JSON.stringify(response));				
			}, 
			function(response) {
				console.log("Error saving list entry data: " + response.status + " " + response.statusText);
			}				 
		);
		
		$state.go('app');		
    }
}])

// Controller for managing todo items of a Todo list.
.controller('ToDoItemListController', ['$scope', '$state', '$stateParams', 'listTodoItemsFactory', 'listFactory', 'todoItemsFactory', function ($scope, $state, $stateParams, listTodoItemsFactory, listFactory, todoItemsFactory) {
	
	$scope.listEntry = {};
    $scope.showListEntry = false;
	
	// Todo List data
    $scope.listEntry = listFactory.get({
            id: $stateParams.id
		})
		.$promise.then(
			function (response) {
				$scope.listEntry = response;
				$scope.showListEntry = true;
			},
			function (response) {
				$scope.message = "Error reading listdata: " + response.status + " " + response.statusText;
			}
		); 
	
	$scope.showItems = false;
	$scope.message = "Loading ...";
	
	// List of Todo items of current list.
	$scope.todoItems = listTodoItemsFactory.get({
			id: $stateParams.id
		})
		.$promise.then(
			function (response) {
				$scope.todoItems = response;
				$scope.showItems = true;
			},
			function (response) {
				$scope.message = "Error reading items of list: " + response.status + " " + response.statusText;
			}
		);
	
	$scope.showDoneItems = false; // false = done items are hidden; true = done items are shown
	$scope.buttonTitle = 'Show done items';
	
	$scope.itemFilter = {done: false}
	
	// List detail is not editable for virtual lists like daily, weekly.
	$scope.editListDetailsAllowed = function(listEntry) {
        if (listEntry.name == 'Today' || listEntry.name == 'Week') {
			return false;
		}		
		return true;
    };
	
	$scope.addNewTodoItem = function(listEntry) {
  		console.log('Add a new todo item to list ' + listEntry.name + ' ...');	
		$state.go('app.todoitemcreate', {id: listEntry._id}, {});
	};
	
	$scope.editTodoItemDetails = function(todoItem) {
  		console.log('Edit details of todo item ' + todoItem.title + ' with id ' + todoItem._id);	
		$state.go('app.todoitemdetail', {id: todoItem._id}, {});
	};
	
	$scope.editListDetails = function() {
		console.log('Edit details of todo list ' + $scope.listEntry.name);	
		$state.go('app.listdetail', {id: $scope.listEntry._id}, {});
	};
	
	$scope.toggleDone = function(todoItem) {
		console.log('toggleDone for item ' + todoItem.title + ', done = ' + todoItem.done);	
		if (todoItem.done == true) {
			var now = new Date();
			todoItem.doneAt = now;
		} 
		todoItemsFactory.update({id: todoItem._id}, todoItem,
			function(response) {
				console.log("Saved todo item with data: " + JSON.stringify(response));				
			}, 
			function(response) {
				console.log("Error saving todo item: " + response.status + " " + response.statusText);
			}				 
		);
	};
	
	$scope.toggleShowDoneItems = function() {
		$scope.showDoneItems = !$scope.showDoneItems;
		console.log('Toggle showDoneItems. Value is: ' + $scope.showDoneItems);	
		if ($scope.showDoneItems) {
			// Delete filter to show all elements
			$scope.itemFilter = {}	
			$scope.buttonTitle = 'Hide done items';
		} else {
			// Add filter to show only elemeents which are not done.
			$scope.itemFilter = {done: false}
			$scope.buttonTitle = 'Show done items';
		}
	};
	
	$scope.isVirtualList = function() {
        return $scope.listEntry.virtual == true;
    };
}])

// Controller for detail page of a specific Todo Item entry
.controller('ToDoItemDetailController', ['$scope', '$state', '$stateParams', 'ngDialog', 'todoItemsFactory', 'listFactory', function ($scope, $state, $stateParams, ngDialog, todoItemsFactory, listFactory) {

	$scope.todoItem = {};
    $scope.showTodoItem = false;
    $scope.message = "Loading ...";
	
	$scope.parentTodoList = {};
	
	$scope.isNew = function () {
        return false;
    };
	
	$scope.localData = {
		dueDate: null
	};
	
    $scope.todoItem = todoItemsFactory.get({
            id: $stateParams.id
        })
        .$promise.then(
            function (response) {
                $scope.todoItem = response;
				$scope.showTodoItem = true;
				
				if ($scope.todoItem.dueDate != null) {
					$scope.localData.dueDate = new Date($scope.todoItem.dueDate);
				} else {
					$scope.localData.dueDate = null;
				}
				
				// Get parent Todo list for Todo item
				$scope.parentTodoList = listFactory.get({
					id: $scope.todoItem.toDolist
				})
				.$promise.then(
					function (response) {
						$scope.parentTodoList = response;						
					},
					function (response) {
						$scope.message = "Error reading parent Todo list: " + response.status + " " + response.statusText;
					}
				); 				
            },
            function (response) {
                $scope.message = "Error reading todo item: " + response.status + " " + response.statusText;
            }
        );  
	
	$scope.submitTodoItemDetail = function () {
		console.log('Save data. dueDate = ', $scope.localData.dueDate);
		$scope.todoItem.dueDate = $scope.localData.dueDate;
		todoItemsFactory.update({id: $stateParams.id}, $scope.todoItem,
			function(response) {
				console.log("Saved todo item with data: " + JSON.stringify(response));				
			}, 
			function(response) {
				console.log("Error saving todo item: " + response.status + " " + response.statusText);
			}				 
		);
		
		var listId = $scope.todoItem.toDolist
		$state.go('app.listtodoitems', {id: listId}, {});
    };
	
	$scope.cancelTodoItemDetail = function () {
		var listId = $scope.todoItem.toDolist
		console.log("Cancel detail view. Going to list with id " + listId);
		$state.go('app.listtodoitems', {id: listId}, {});	
	}
	
	$scope.openConfirmDelete = function () {
		ngDialog.openConfirm({
			template: 'confirmTodoItemMessageId',
			className: 'ngdialog-theme-default'
		}).then(function (value) {
			// Delete Todo item
			var listId = $scope.todoItem.toDolist
			console.log("Delete Todo item with id " + $scope.todoItem._id);
			todoItemsFactory.delete({id: $scope.todoItem._id});
			$state.go('app.listtodoitems', {id: listId}, {reload: true});
		}, function (reason) {
			// Do nothing
		});
	};
}])

// Controller for creating a new Todo Item entry
.controller('ToDoItemCreationController', ['$scope', '$state', '$stateParams', 'todoItemsFactory', 'listFactory', function ($scope, $state, $stateParams, todoItemsFactory, listFactory) {
	
	var listId = $stateParams.id
	console.log("Creating new item for list " + listId);
	
	$scope.todoItem = {
		title: "",
		note: "",
		done: false,
		doneAt: null,
		dueDate: null,
		toDolist: listId
	};
	
	$scope.localData = {
		dueDate: null
	};
	
	$scope.parentTodoList = {};
	
	$scope.isNew = function () {
        return true;
    };
	
	// Get parent Todo list for Todo item
	$scope.parentTodoList = listFactory.get({
		id: $scope.todoItem.toDolist
	})
	.$promise.then(
		function (response) {
			$scope.parentTodoList = response;						
		},
		function (response) {
			$scope.message = "Error reading parent Todo list: " + response.status + " " + response.statusText;
		}
	); 	
	
	$scope.submitTodoItemDetail = function () {
		console.log('Save data. dueDate = ', $scope.localData.dueDate);
		$scope.todoItem.dueDate = $scope.localData.dueDate;
		todoItemsFactory.save($scope.todoItem,
			function(response) {
				console.log("Saved todo item with data: " + JSON.stringify(response));				
			}, 
			function(response) {
				console.log("Error saving todo item: " + response.status + " " + response.statusText);
			}				 
		);
		
		$state.go('app.listtodoitems', {id: listId}, {});	
    };
	
	$scope.cancelTodoItemDetail = function () {
		var listId = $scope.todoItem.toDolist
		$state.go('app.listtodoitems', {id: listId}, {});	
	}
}])


.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
		
		// After Login goto home page.
		$state.go('app', {}, {reload:true});
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('FooterController', ['$scope', '$state', '$rootScope', function ($scope, $state, $rootScope) {
	
}])

.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])
;