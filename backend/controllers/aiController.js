import Document from '../models/Document.js';
import Flashcard from '../models/FlashCard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

//@desc Generate flashcards from document 
//@route POST/api/ai/generate-flashcards
//@access Private
export const generateFlashcards = async (req, res, next) => {
    try{

    } catch (error) {
        next(error);
    }
};

//@desc Generate quiz from document
//@route POST/api/ai/generate-quiz
//@access Private
export const generateQuiz = async (req, res, next) => {
    
};

//@Generate document summary
//@route POST/api/ai/generate-summary
//@access Private
export const generateSummary = async (req, res, next) => {
    
};

//@desc Chat with AI
//@route POST/api/ai/chat
//@access Private
export const chat = async (req, res, next) => {
    
};

//@desc Explain concept from document 
//@route POST/api/ai/explain-concept
//@access Private
export const explainConcept = async (req, res, next) => {
    
};

//@desc Get chat history for a document
//@route GET/api/ai/chat-history/:documentId
//@access Private
export const getChatHistory = async (req, res, next) => {

};
    
    




    
