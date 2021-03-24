(function ( $ ) {
 
    $.fn.puissance4 = function( options ) {
 
        var settings = $.extend({
            col: 7,
            lgn: 6
        }, options );

        

        class P4 {
            constructor(selector){
                this.COL = settings.col;                           // a modifier pour transformer COL et LGN en variables fournie par un paramètre du plugin à venir
                this.LGN = settings.lgn;
                this.selector = selector;
                this.player = 'ONE';
                this.scoreP1 = 0;
                this.scoreP2 = 0;
                this.round = 0;
                this.roundMax = settings.col*settings.lgn;
                this.lastCase;

                this.drawGame();
                this.ecoute();
                this.checkWin();
                this.scoreWin();
            }

            //Afficher le plateau de jeu
            drawGame(){
                const $jeu = $(this.selector);
                for(let lgn=0;lgn<this.LGN;lgn++){              // pour chaque ligne je fais une div class lgn
                    const $lgn = $('<div>').addClass('lgn');
                    for(let col=0;col<this.COL;col++){          //Dans chaque ligne je fais autant de colonnes que le paramètre en faisant des div class col
                        const $col = $('<div>').addClass('col empty').attr('data-col', col).attr('data-lgn', lgn);      //avec la position en stockage pour plus tard
                        $lgn.append($col);
                    }
                    $jeu.append($lgn);                      // affichage des colonnes dans les lignes puis des lignes
                }
            }

            scoreWin(winner){                    
                if(winner == 'ONE'){
                    this.scoreP1++;
                    $('#playerOne').text(this.scoreP1);
                }
                else if(winner == 'TWO'){
                    this.scoreP2++;
                    $('#playerTwo').text(this.scoreP2);
                }
            }

            ecoute(){
                const $jeu = $(this.selector);
                const that = this;          //this ne fait plus référence à la même chose, du coup pour pouvoir continuer à l'utiliser il est stocké dans that
        
                function lastCase(col){          //récupérer la dernière case libre
                    const $cells = $(`.col[data-col='${col}']`);       
                    for(let i=$cells.length-1;i>=0;i--){                //parcours tout le tableau pour trouver les cases vides
                        const $cell = $($cells[i]);
                        if($cell.hasClass('empty')){
                            return $cell;
                        }
                    }
                    return null;
                }
                $jeu.on('mouseenter', '.col.empty', function(){             //affiche une prévisualisation du choix de colonne utilisateur au moment du survol
                    const $col = $(this).data('col');
                    const $last = lastCase($col);
                    if($last != null){
                        $last.addClass(`p${that.player}`);
                    }
                });
                $jeu.on('mouseleave', '.col', function(){             //retire l'affichage de la prévisualisation quand le survol est terminé
                    $('.col').removeClass(`p${that.player}`);
                });
                $jeu.on('click', '.col.empty', function(){
                    const col = $(this).data('col');
                    const $last = lastCase(col);
                    $last.addClass(`${that.player}`).removeClass(`empty p${that.player}`).data('player', `${that.player}`);
                    that.round++;
                    $('#count').text(that.round);  
                    $('#cancel').css('visibility', 'visible');
                    //compteur de tour
                    if(that.round === that.roundMax){
                        alert('Plus de tour possible !');
                        $('#restart').css('visibility', 'visible');
                        $('#game').css('pointer-events', 'none');
                        that.round = 0;
                        $('#count').text(that.round);               //réinitialisation compteur
                    }
                    const winner = that.checkWin($last.data('lgn'), $last.data('col'));
                    that.player = (that.player === 'ONE')? 'TWO' : 'ONE';            //changemen de joueur : si player est red on passe à jaune, sinon on passe à red
                    if(winner){
                        $('#cancel').css('visibility', 'hidden');
                        alert(`Le joueur ${winner} a gagné la partie.`);
                        that.scoreWin(winner);
                        $('#restart').css('visibility', 'visible');
                        $('#game').css('pointer-events', 'none');
                        that.round = 0;
                        $('#count').text(that.round);
                        return;
                    }
                    that.lastCase = $last;
                });
                $('#cancel').on('click', function(){
                    that.player = (that.player === 'ONE')? 'TWO' : 'ONE';            //changemen de joueur : si player est red on passe à jaune, sinon on passe à red
                    that.lastCase.removeClass(`${that.player}`).addClass('empty').removeData();
                    that.round--;
                    $('#count').text(that.round);
                    $('#cancel').css('visibility', 'hidden');
                })
            }
            

            checkWin(lgn, col){
                const that = this;
                
                function getCell(i, j){                 //récupérer les positions
                    return $(`.col[data-lgn='${i}'][data-col='${j}']`);
                }
                function checkDirection(direction){                 //vérifie si l'absisse et l'ordonnée sont valables et si le pion voisin appartient toujours au même joueur
                    let total = 0;
                    let i = lgn + direction.i;
                    let j = col + direction.j;
                    let $next = getCell(i, j);

                    while(i>=0 && i<that.LGN && j>=0 && j<that.COL && $next.data('player') === that.player){
                        total++;
                        i += direction.i;
                        j += direction.j;
                        $next = getCell(i, j);
                    }
                    return total;
                }

                function checkWin(directionA, directionB){
                    const total = 1 + checkDirection(directionA) +checkDirection(directionB);           //vérifie si dans les deux direction si la combinaison est gagnante
                    if(total>=4){
                        return that.player;
                    }
                    else{
                        return null;
                    }
                    
                }

                function checkHori(){
                    return checkWin({i: 0, j: -1}, {i: 0, j: 1});       //définie horizontal (sera vérifié vers la gauche et la droite par checkWin)
                }

                function checkVerti(){
                    return checkWin({i: -1, j: 0}, {i: 1, j: 0});       //définie vertical (sera vérifié vers el haut et le bas par checkWin)
                }   

                function checkDiag1(){
                    return checkWin({i: 1, j: 1}, {i: -1, j: -1});
                }

                function checkDiag2(){
                    return checkWin({i: 1, j: -1}, {i: -1, j: 1});
                }

                return checkHori() || checkVerti() || checkDiag1() || checkDiag2();                     //retourne le resultat pour afficher un gagnant            
            }
        } 


        $('#game').ready(function(){
            const p4 = new P4('#game');

            $('#restart').on('click', function(){
                $('#game').empty();
                $('#game').css('pointer-events', 'auto');
                p4.drawGame();
                $('#restart').css('visibility', 'hidden');
            })
        });
    };

}( jQuery ));