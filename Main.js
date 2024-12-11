function Main(){
    function fetchPokeData(callback) {
        fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
            .then(response => response.json())
            .then(jsonData => {
                let pokedata = jsonData.results.map(pokemon => {
                    pokemon.name = pokemon.name.split('-').join(' ');
                    return pokemon;
                });
                console.log(pokedata);
                callback(pokedata);
            });
    }
    
    function fetchPokeData2(callback) {
        fetch("https://pokeapi.co/api/v2/pokemon?offset=1025&limit=277")
            .then(response => response.json())
            .then(jsonData => {
                let pokedata2 = jsonData.results.map(pokemon2 => {
                    pokemon2.name = pokemon2.name.split('-').join(' ');
                    return pokemon2;
                });
                let validPokedata2 = pokedata2.filter(pokemon2 => {
                    return !inValidForm.some(word => pokemon2.name.includes(word));
                });
                console.log(pokedata2);
                console.log(validPokedata2);
                callback(validPokedata2);
            });
    }
    
    function mainGame() {
        fetchPokeData(pokemon => {
            fetchPokeData2(pokemon2 => {
                let fullPokeDex = pokemon.concat(pokemon2);
                let generations = [];
    
                generations.push(fullPokeDex.slice(0, 151)); // Generation I
                generations.push(fullPokeDex.slice(151, 251)); // Generation II
                generations.push(fullPokeDex.slice(251, 386)); // Generation III
                generations.push(fullPokeDex.slice(386, 493)); // Generation IV
                generations.push(fullPokeDex.slice(493, 649)); // Generation V
                generations.push(fullPokeDex.slice(649, 721)); // Generation VI
                generations.push(fullPokeDex.slice(721, 809)); // Generation VII
                generations.push(fullPokeDex.slice(809, 905)); // Generation IIX
                generations.push(fullPokeDex.slice(905, 1025)); // Generation IX
                generations.push(fullPokeDex.slice(1025)); // Others

                /*Forms **WIP**
                //generations[6] = generations[6].concat(pokemon2.filter(pokemon => pokemon.name.includes("alola"))); // Alola Forms
                //generations.push(fullPokeDex.slice(898, 908)); // Hisui
                generations[8] = generations[8].concat(pokemon2.filter(pokemon => pokemon.name.includes("hisui"))); // Hisui Forms*/
    
                console.log(generations);

                displayPreGame(generations)

                return (generations)
            });
        });
    }
    
    let inValidForm = [
    "small","large","super","mega","totem","eternal","star","phd","libre","cosplay","cap",
    "greninja","zygarde","minior","mimikyu","magearna","starter","gmax","origin","tatsugiri",
    "squawkabilly","koraidon","miraidon","ursaluna","own","eternamax","palafin","female",
    "dudunsparce","maushold","deoxys","striped","dada","low","school","noice"
    ];

    function displayPreGame(generations) {
        let checkboxes = document.querySelectorAll('.checkboxBox input[type="checkbox"]');
        let selectedGens = [];
        let message = "Selected generations: "
    
        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                selectedGens.push(checkbox.value);
                message += `Gen${parseInt(checkbox.value)+1} `
            }
        });

        let chosenGenerations = selectedGens.map(function(selectedGen) {
            return generations[selectedGen];
        });

        let chooseContainer = document.querySelector('.container');
        chooseContainer.style.display = 'none';

        alert(message);  

        let gameContainer = document.querySelector('.gamescreen');
        gameContainer.style.display = 'block';
    
        console.log(chosenGenerations) 

        function mergeArrays(arrays) {
            return arrays.reduce((merged, currentArray) => {
              return merged.concat(currentArray);
            }, []);
        }

        let chooseFrom = mergeArrays(chosenGenerations);
        
        selectRandomMon(chooseFrom);

        return chosenGenerations,chooseFrom;
    }

    function selectRandomMon(chooseFrom) {
        function getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        let randomIndex = getRandomNumber(0, chooseFrom.length - 1);
        let randomPokemon = chooseFrom[randomIndex];
        let pokemonUrl = randomPokemon.url;
        fetchPokemonData(pokemonUrl);

        function fetchPokemonData(pokemonUrl) {
            fetch(pokemonUrl)
            .then(response => response.json())
                .then(data => {
                    let requiredObjects = ['id', 'abilities', 'stats', 'types', 'sprites', 'name'];
                    let extractedData = {};
                    
                    requiredObjects.forEach(obj => {
                        if (obj === 'sprites') {
                            extractedData['official-artwork.front_default'] = data.sprites.other['official-artwork'].front_default;
                        } else {
                            extractedData[obj] = data[obj];
                        }
                    })
                    //console.log(extractedData);
                    displayGame(extractedData)
                    return(extractedData);
            })   
        }
    }
 
    function displayGame(extractedData){

        extractedData.abilities = extractedData.abilities.map(ability => ({
            name: ability.ability.name.split('-').join(' '),
            slot: ability.slot,
            is_hidden: ability.is_hidden
        }));

        extractedData.stats = extractedData.stats.map(stat => ({
            base_stat: stat.base_stat,
            effort: stat.effort,
            stat_name: stat.stat.name
        }));

        extractedData.types = extractedData.types.map(type => ({ 
            name: type.type.name
        }));

        console.log(extractedData);

        let { id, abilities, stats, types, name } = extractedData;
        let sprites = extractedData["official-artwork.front_default"]
        let baseStatTotal = 0;
        
        stats.forEach(stat => {
            baseStatTotal += stat.base_stat;
        });
        let outputData = {id, abilities, baseStatTotal, stats, types, sprites, name};

        let guessInput = document.getElementById('guess-input');
        let submitBtn = document.getElementById('submit-btn');

        let guesslimit = 6;
        let wrongGuesses = 0;
        let correctGuess = false;
        let remainingGuesses = guesslimit;

        document.getElementById('image-here').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png";
        document.getElementById('id').innerHTML = outputData.id;
        document.getElementById('ability-1').innerHTML = "N/A";
        document.getElementById('ability-2').innerHTML = "N/A"; 
        document.getElementById('hidden-ability').innerHTML = "N/A"; 
        

        submitBtn.addEventListener('click', handleSubmit);

        document.removeEventListener('keydown', keydownListener);

        document.addEventListener('keydown', handleEnterKey);

        function handleEnterKey(e) {
            if (e.key === "Enter") { 
                handleSubmit(); 
            }
        }

        function handleSubmit() {
            let guess = guessInput.value.trim();

            if (remainingGuesses < 1) {
                document.getElementById('wrong').innerHTML = 'Sorry, you ran out of guesses!';
                guessInput.disabled = true; 
                submitBtn.disabled = true; 
            } else if (guess.toLowerCase() == name) {
                document.getElementById('wrong').innerHTML = 'Congratulations! You guessed correctly!';
                submitBtn.removeEventListener('click', handleSubmit); 
                correctGuess = true;
                submitBtn.style.display = 'none';
                displayNextInfo(outputData);
            } else {
                document.getElementById('wrong').innerHTML = 'Sorry, that is incorrect!';                
                displayGuess(guess);
                wrongGuesses++;
                displayNextInfo(outputData);
                remainingGuesses--;
            }
        }

        function displayGuess(guess) {

            let guessesContainer = document.querySelector('.guesses');
            let guessElement = document.createElement('p');

            if (correctGuess === true){
                guessElement.classList.add('guess-correct');
            } else {
                guessElement.classList.add('guess-wrong');
            }
            guessElement.textContent = guess;

            guessesContainer.appendChild(guessElement);

        }

        function displayNextInfo(outputData) {

            if (correctGuess === true){
                outputData.abilities.forEach(ability => {
                    let slot = ability.slot
                    if (slot == 1) {
                        let ability1 = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('ability-1').innerHTML = ability1;

                    } else if (slot == 2) {
                        let ability2 = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('ability-1').innerHTML = ability2;

                    } else if (document.getElementById('ability-2').innerHTML === "" && slot == 3) {
                        let hiddenAbility = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('hidden-ability').innerHTML = hiddenAbility;
                        document.getElementById('ability-2').innerHTML = "N/A";
                        
                    } else if (slot == 3) {
                        let hiddenAbility = ability.name;
                        document.getElementById('hidden-ability').innerHTML = hiddenAbility;

                    } else {
                        document.getElementById('ability-2').innerHTML = "N/A"; 
                        document.getElementById('hidden-ability').innerHTML = "N/A"; 
                    }
                });
                document.getElementById('stat-bst').innerHTML = outputData.baseStatTotal;

                outputData.stats.forEach(stat => {
                    document.getElementById(`stat-${stat.stat_name}`).innerHTML = stat.base_stat;
                })
                
                outputData.types.forEach((type, index) => {
                    let capitalizedType = type.name.charAt(0).toUpperCase() + type.name.slice(1);                
                    let formattedType = index === 0 ? capitalizedType : `, ${capitalizedType}`;
                    document.getElementById('types').innerHTML += formattedType;
                });

                document.getElementById('image-here').src = outputData.sprites;

                let pokename = outputData.name.charAt(0).toUpperCase() + outputData.name.slice(1)
                document.getElementById('name').innerHTML = pokename;

            } else if (wrongGuesses == 1) {
                
                outputData.abilities.forEach(ability => {
                    let slot = ability.slot
                    if (slot == 1) {
                        let ability1 = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('ability-1').innerHTML = ability1;

                    } else if (slot == 2) {
                        let ability2 = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('ability-2').innerHTML = ability2;

                    }  else if (document.getElementById('ability-2').innerHTML === "" && slot == 3) {
                        let hiddenAbility = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('hidden-ability').innerHTML = hiddenAbility;
                        document.getElementById('ability-2').innerHTML = "N/A";
                        
                    } else if (slot == 3) {
                        let hiddenAbility = ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
                        document.getElementById('hidden-ability').innerHTML = hiddenAbility;

                    } else {
                        document.getElementById('ability-2').innerHTML = "N/A"; 
                        document.getElementById('hidden-ability').innerHTML = "N/A"; 
                    }
                });
            } else if (wrongGuesses == 2){
                document.getElementById('stat-bst').innerHTML = outputData.baseStatTotal;

            } else if (wrongGuesses == 3){
                outputData.stats.forEach(stat => {
                    document.getElementById(`stat-${stat.stat_name}`).innerHTML = stat.base_stat;})

            } else if (wrongGuesses == 4){
                outputData.types.forEach((type, index) => {
                    let capitalizedType = type.name.charAt(0).toUpperCase() + type.name.slice(1);                
                    let formattedType = index === 0 ? capitalizedType : `, ${capitalizedType}`;
                    document.getElementById('types').innerHTML += formattedType;
                });

            } else if (wrongGuesses == 5){
                document.getElementById('image-here').src = outputData.sprites;
            
            } else if (wrongGuesses == 6){
                let pokename = outputData.name.charAt(0).toUpperCase() + outputData.name.slice(1)
                document.getElementById('name').innerHTML = pokename;
                submitBtn.style.display = 'none';
            }

        }
        
    }

    mainGame()
}

document.getElementById('pressplay').addEventListener('click', function clickHandler() {
    Main();
    document.removeEventListener('keydown', keydownListener);
    
});

function keydownListener(e) {
    if (e.key >= "0" && e.key <= "9") { 
        let checkboxIndex = parseInt(e.key); 
        if (checkboxIndex >= 0 && checkboxIndex <= 9) { 
            let checkboxId = "Generation" + (checkboxIndex); 
            let checkbox = document.getElementById(checkboxId);
            if (checkbox.checked === false) {
                checkbox.checked = true;
            } else if (checkbox.checked === true) {
                checkbox.checked = false;
            }
        }
    } else if (e.key === "Enter") { 
        Main();
        document.removeEventListener('keydown', keydownListener);
    }
}

document.addEventListener('keydown', keydownListener);









