document.addEventListener('DOMContentLoaded', () => {
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    // Toggle Chat Window
    chatIcon.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if(!chatWindow.classList.contains('hidden')) {
            setTimeout(() => chatInput.focus(), 100);
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    // Handle "Enter" key in textarea to submit
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line
            chatForm.dispatchEvent(new Event('submit')); // Trigger form submit
        }
    });

    // Handle Form Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Display user's message
        appendMessage(userMessage, 'sent');
        chatInput.value = '';

        // Show typing indicator
        const typingIndicator = appendMessage('...', 'received', true);

        try {
            // Send message to the backend
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: userMessage }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            
            // Remove typing indicator and show AI response
            typingIndicator.remove();
            appendMessage(data.reply, 'received');

        } catch (error) {
            typingIndicator.remove();
            appendMessage('Sorry, I seem to be having trouble right now. Please try again later.', 'received');
            console.error('Chatbot fetch error:', error);
        }
    });

    function appendMessage(text, type, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        
        const p = document.createElement('p');
        // Handle newlines in the text for display
        p.innerHTML = text.replace(/\n/g, '<br>');
        
        if(isTyping) p.classList.add('typing');

        messageDiv.appendChild(p);
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
        return messageDiv;
    }
});