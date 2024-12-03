document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-button');
    const pokemonList = document.getElementById('pokemon-list');
    const pokemonDetails = document.getElementById('pokemon-details');

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        
        if (query) {
            searchPokemonByName(query);
        } else {
            fetchPokemons();
        }
    });

    async function fetchPokemons() {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
            if (!response.ok) throw new Error('Błąd podczas pobierania listy Pokemonów');
            const data = await response.json();
            
            const Pokemons = await getPokemonsInfo(data.results);
            displayPokemonList(Pokemons);
        } catch (error) {
            pokemonList.innerHTML = `<p>${error.message}</p>`;
        }
    }

    async function searchPokemonByName(name) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (!response.ok) throw new Error('Pokemon nie znaleziony');
            const pokemon = await response.json();
            
            displayPokemonList([pokemon]);
        } catch (error) {
            pokemonList.innerHTML = `<p>${error.message}</p>`;
        }
    }

    async function getPokemonsInfo(pokemons) {
        const detailedPokemons = await Promise.all(pokemons.map(async pokemon => {
            const details = await fetch(pokemon.url).then(res => res.json());
            return { name: pokemon.name , id: details.id, sprites: details.sprites };
        }));
        return detailedPokemons
    }

    async function fetchPokemonDetails(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Pokemon nie znaleziony');
            const pokemon = await response.json();
            displayPokemonDetails(pokemon);
        } catch (error) {
            pokemonDetails.innerHTML = `<p>${error.message}</p>`;
        }
    }

    function displayPokemonList(pokemons) {
        pokemonList.innerHTML = '';
        pokemons.forEach(pokemon => {
            const pokemonItem = document.createElement('div');
            pokemonItem.className = 'pokemon-item';
            pokemonItem.innerHTML = `
                <img src="${pokemon.sprites?.front_default || ''}" alt="${pokemon.name}">
            `;

            const pokemonInfo = document.createElement('div');
            pokemonInfo.className = 'pokemon-info';
            pokemonInfo.innerHTML = `
                <div>#${pokemon.id}</div>
                <div>${pokemon.name}</div>
            `;

            pokemonItem.appendChild(pokemonInfo);
            pokemonItem.addEventListener('click', () => fetchPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`));
            pokemonList.appendChild(pokemonItem);
        });
    }

    function displayPokemonDetails(pokemon) {
        const detailsContainer = document.getElementById('pokemon-details');
        detailsContainer.innerHTML = '';

        const details = document.createElement('div');
        details.className = 'pokemon-info2';
        details.innerHTML = `
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Typ: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
            <p>Wzrost: ${pokemon.height / 10} m</p>
            <p>Waga: ${pokemon.weight / 10} kg</p>
            <h3>Podstawowe statystyki:</h3>
            <ul>
                ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
        `;
        detailsContainer.appendChild(details);
    }

    fetchPokemons();
});
