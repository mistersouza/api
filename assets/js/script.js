const API_KEY = 'r_n0w2NZIhx5NFjLagZHib1X4ZQ'
const API_URL = 'https://ci-jshint.herokuapp.com/api'
const resultsModal = new bootstrap.Modal(document.querySelector('#resultsModal'))


document.querySelector('#status').addEventListener('click', event => getStatus(event))
document.querySelector('#submit').addEventListener('click', event => handleSubmit(event))

const displayStatus = (data) => {
    const { expiry } = data
    
    resultsModal.show()
    document.querySelector('.modal-title').innerText = 'API Key Status'
    document.querySelector('.modal-body').innerHTML = `<div>Your key is valid until</div><div>${expiry}</div>`
}

const getStatus = async() => {
    const queryString = `${API_URL}?api_key=${API_KEY}`

    try {
        const response = await fetch(queryString)
        const data = await response.json()

        if (response.ok) displayStatus(data)
        if (!response.ok) {
            displayException(data)
            throw new Error(data.error)
        }
    } catch (error) {
        console.error({ error })
    }
}

const parseForm = (form) => {
    let options = [];

    for (let entry of form.entries()) {
        if (entry[0] === 'options') {
            options.push(entry[1]);
        }
    }
    form.delete('options');
    form.append('options', options.join());
}

const handleSubmit = async(event) => {
    event.preventDefault(); 

    const form = parseForm(new FormData(document.querySelector('#checks'))); 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
            },
            body: form,
        })

        const data = await response.json();

        if (response.ok) displayErrors(data); 
        if (!response.ok) {
            displayException(data)
            throw new Error(data.error); 
        }
    } catch (error) {
        console.error({ error })
    }
}

const displayErrors = (data) => {
    const { error_list, file, total_errors } = data;
    let html; 

    if (!total_errors) {
        document.querySelector('.modal-body').innerHTML = `<div>No errors reported!</div>`;
    } else {
        html = `<div>Total Errors: ${total_errors}</div>`;
        for (let error of error_list) {
            html += `<div>at line <span>${error.line}</span>, column <span>${error.col}</span></div>`;
            html += `<div>${error.error}</div>`;
        }
    }

    document.querySelector('.modal-title').innerText = `JSHint Results for ${file}`;
    document.querySelector('.modal-body').innerHTML = results;
    resultsModal.show();   
}

const displayException = (data) => {
    const { error, error_no, status_code } = data;
    
    document.querySelector('.modal-title').innerText = 'An Exception Occurred';

    let html = `
        <div>Status Code: ${status_code}</div>
        <div>Error Number: ${error_no}</div>
        <div>Error: ${error}</div>
    `; 

    document.querySelector('.modal-body').innerHTML = html;
    resultsModal.show();
}