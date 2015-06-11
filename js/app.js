(function(){
    var app = angular.module("gallery",['ui.bootstrap','ui.bootstrap.modal']);

    app.directive('fallbackSrc', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                
                element.bind('error', function(){
                    element.attr('src', attrs.fallbackSrc);
                });
            }
        };
    });
    app.filter('startFrom',function(){
        return function(input,start,search) {
            if (search != undefined && search.length > 0){
                return input;
            }
            start = +start; //int parsing
            return input.slice(start);
        }
    });
    app.directive("myGallery",function(){
        return {
            restrict: "E",
            scope: {
                myFeed: "@feed",
                mySearch: "@search",
                myPagination: "@pagination",
                myResultsPerPage: "@resultsPerPage",
                mySorting: "@sorting",
                myAutoRotateTime: "@autoRotateTime"
            },
            templateUrl: "templates/gallery-browse.html",
            controller: function($scope, $http) {
                this.images = [];
                this.resultsPerPageNum = $scope.myResultsPerPage;
                this.numberOfPages = Math.ceil(this.images.length / this.resultsPerPageNum);
                this.currentPage = 1;
                this.timeToRotate = $scope.myAutoRotateTime || 4;
                this.currentImage = this.images[0]; //defaults to first image
                this.sortBy = "title";
                this.index = 0;
                this.timer = null;
                this.pageChanged = function() {
                    //console.log(this.currentPage);
                }
                var self = this;
                // image preview modal:
                this.openImage = function(index) {
                    if (index > this.images.length || index < 0) {
                        index = 0;
                    }
                    this.index = index;
                    this.currentImage = this.images[index];
                    $scope.showModal = true;
                    
                };
                this.closeImage = function () {
                    $scope.showModal = false;
                };
                // slideshow modal:
                this.startSlideShow = function() {
                    $scope.showSlideModal = true;
                    this.timer = setInterval(function(){
                        self.index++;
                        $scope.$apply(function() {
                            $scope.slideUrl = self.images[self.index].url;
                        });
                    },self.timeToRotate * 1000);
                };
                this.closeSlideShow = function() {
                    $scope.showSlideModal = false;
                    clearInterval(this.timer);

                };
                $scope.sort = function(image) {
                    if (self.sortBy == "title"){
                        return image.title;
                    } else {
                        return new Date(image.date);
                    }
                };
                $scope.getData = function(feed,isLiteral){
                    if (isLiteral){
                        self.images = feed;
                        self.numberOfPages = Math.ceil(self.images.length / self.resultsPerPageNum);
                    } else {
                        $http.get(feed).then(function(result) {
                            self.images = result.data;
                            self.numberOfPages = Math.ceil(self.images.length / self.resultsPerPageNum);
                        });    
                    }
                };
            },
            link: function(scope, element, attrs) {
                // Is the feed given as a literal string?
                try {
                    var json = JSON.parse(attrs.feed);
                    scope.getData(json,true);
                } catch(e) {
                    scope.getData(attrs.feed,false); // Or is it a file?
                }
            },
            controllerAs: "galleryCtrl"
        };
    });
})();