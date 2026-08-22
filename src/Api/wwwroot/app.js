const API_URL = "/api";

const statusNames = {
    prcs: "Ожидает открытия",
    actv: "Активен",
    blck: "Заблокирован",
    clsd: "Закрыт"
};

let selectedClient = null;

const clientsElement = document.querySelector("#clients");
const walletsElement = document.querySelector("#wallets");
const messageElement = document.querySelector("#message");
const form = document.querySelector("#createWalletForm");

document.querySelector("#refreshClients").addEventListener("click", loadClients);
form.addEventListener("submit", createWallet);

loadClients();

async function request(url, options = {}) {
    try {
        const response = await fetch(API_URL + url, {
            ...options,
            headers: options.body
                ? { "Content-Type": "application/json" }
                : {}
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errors = data?.errors
                ? Object.values(data.errors).flat().join(" ")
                : "";

            throw new Error(
                data?.detail || errors || data?.title || "Ошибка API."
            );
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Не удалось подключиться к API.");
        }

        throw error;
    }
}

async function loadClients() {
    clientsElement.textContent = "Загрузка клиентов...";

    try {
        const clients = await request("/clients");

        showClients(clients);

        if (selectedClient) {
            const client = clients.find(
                item => item.mid === selectedClient.mid
            );

            if (client) {
                selectedClient = client;
                showClientInfo(client);
            }
        }
    } catch (error) {
        clientsElement.textContent = "Не удалось загрузить клиентов.";
        showMessage(error.message);
    }
}

function showClients(clients) {
    document.querySelector("#clientCount").textContent = clients.length;
    clientsElement.replaceChildren();

    if (clients.length === 0) {
        clientsElement.textContent = "Клиентов нет.";
        return;
    }

    clients.forEach(client => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "client-button";
        button.textContent = `${client.fullName} (${client.mid})`;
        button.addEventListener("click", () => selectClient(client));

        clientsElement.appendChild(button);
    });
}

async function selectClient(client) {
    selectedClient = client;

    hideMessage();
    showClientInfo(client);

    document.querySelector("#emptyState").hidden = true;
    document.querySelector("#clientDetails").hidden = false;
    document.querySelector("#walletsCard").hidden = false;
    document.querySelector("#createWalletCard").hidden = false;

    await loadWallets();
}

function showClientInfo(client) {
    document.querySelector("#clientMid").textContent = client.mid;
    document.querySelector("#clientFullName").textContent =
        client.fullName || "Не задано";
    document.querySelector("#participantId").textContent =
        client.digitalRubleParticipantId || "Не задано";
}

async function loadWallets() {
    walletsElement.textContent = "Загрузка кошельков...";

    try {
        const wallets = await request(
            `/clients/${encodeURIComponent(selectedClient.mid)}/wallets`
        );

        showWallets(wallets);
        setCreateFormState(wallets);
    } catch (error) {
        walletsElement.textContent = "Не удалось загрузить кошельки.";
        showMessage(error.message);
    }
}

function setCreateFormState(wallets) {
    const hasActiveWallet = wallets.some(wallet => {
        const status = String(wallet.status).toLowerCase();

        return ["prcs", "actv", "blck"].includes(status);
    });

    const controls = form.querySelectorAll("input, select, button");

    controls.forEach(control => {
        control.disabled = hasActiveWallet;
    });

    document.querySelector("#createWalletHint").textContent = hasActiveWallet
        ? "У клиента уже есть открытый кошелёк. Новый создать нельзя."
        : "Можно создать новый кошелёк.";
}

async function createWallet(event) {
    event.preventDefault();
    hideMessage();

    const code = form.elements.walletCode.value.trim();

    if (!code) {
        showMessage("Введите код кошелька.");
        return;
    }

    const button = form.querySelector("button[type=submit]");

    button.disabled = true;
    button.textContent = "Создание...";

    const data = {
      mid: selectedClient.mid,
      digitalRubleParticipantId: form.elements.digitalRubleParticipantId.value.trim(),
      walletCode: code,
      status: form.elements.status.value,
      accountNumber: form.elements.accountNumber.value.trim() || null,
    };

    try {
        await request("/platform/wallets", {
            method: "PUT",
            body: JSON.stringify(data)
        });

        form.reset();
        showMessage("Кошелёк создан.", "success");

        await loadWallets();
    } catch (error) {
        showMessage(error.message);
    } finally {
        button.textContent = "Создать";

        if (!form.elements.walletCode.disabled) {
            button.disabled = false;
        }
    }
}

function showWallets(wallets) {
    walletsElement.replaceChildren();

    if (wallets.length === 0) {
        walletsElement.textContent = "У клиента пока нет кошельков.";
        return;
    }

    const table = document.createElement("table");
    const body = document.createElement("tbody");

    table.innerHTML = `
        <thead>
            <tr>
                <th>Код</th>
                <th>Статус</th>
                <th>Счёт</th>
                <th></th>
            </tr>
        </thead>
    `;

    wallets.forEach(wallet => {
        body.appendChild(createWalletRow(wallet));
    });

    table.appendChild(body);
    walletsElement.appendChild(table);
}

function createWalletRow(wallet) {
    const row = document.createElement("tr");
    const status = String(wallet.status || "").toLowerCase();
    const hasAccount = wallet.accountNumber && wallet.accountNumber.trim();

    const codeCell = document.createElement("td");
    codeCell.textContent = wallet.code;

    const statusCell = document.createElement("td");
    const currentStatus = document.createElement("div");
    const statusSelect = document.createElement("select");

    currentStatus.textContent = statusNames[status] || wallet.status;
    statusSelect.innerHTML = `
        <option value="">Не менять</option>
        <option value="Actv">Actv — активен</option>
        <option value="Blck">Blck — заблокирован</option>
        <option value="Clsd">Clsd — закрыт</option>
    `;
    statusCell.append(currentStatus, statusSelect);

    const accountCell = document.createElement("td");
    accountCell.textContent = hasAccount ? wallet.accountNumber : "Не задан";

    let accountInput = null;

    if (!hasAccount) {
        accountInput = document.createElement("input");
        accountInput.placeholder = "Номер счёта";

        accountCell.appendChild(accountInput);
    }

    const actionCell = document.createElement("td");
    const saveButton = document.createElement("button");

    saveButton.type = "button";
    saveButton.textContent = "Сохранить";
    saveButton.addEventListener("click", () => {
        updateWallet(wallet, statusSelect, accountInput, saveButton);
    });

    actionCell.appendChild(saveButton);
    row.append(codeCell, statusCell, accountCell, actionCell);

    return row;
}

async function updateWallet(wallet, statusSelect, accountInput, button) {
    const accountNumber = accountInput ? accountInput.value.trim() : "";

    if (!statusSelect.value && !accountNumber) {
        showMessage("Выберите новый статус или заполните номер счёта.");
        return;
    }

    const data = {};

    if (statusSelect.value) {
        data.status = statusSelect.value;
    }

    if (accountNumber) {
        data.accountNumber = accountNumber;
    }

    button.disabled = true;
    button.textContent = "Сохранение...";

    try {
        await request(`/platform/wallets/${encodeURIComponent(wallet.code)}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });

        showMessage("Кошелёк обновлён.", "success");

        await loadWallets();
    } catch (error) {
        showMessage(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Сохранить";
    }
}

function showMessage(text, type = "error") {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.hidden = false;
}

function hideMessage() {
    messageElement.hidden = true;
}
