import Document from '../models/Document.js';
import Flashcard from '../models/FlashCard.js';
import quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';


//@desc Upload PDF document
//@route POST/api/documents/upload
//@access Private

export const uploadDocument = async ( req, res, next ) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { tite } = req.body;

        if (!title) {
            // Delete uploaded file if no title is provided
            await fs.unlink(req.file.path);
            return res.status(400).json ({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400,  
            });
        }

        //Construct the URL for the uploaded document
        const baseUrl = `http://loaclhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.fie.filename}`;

        //Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl, //Store the URL instead of the local path
            fileSize: req.file.size,
            status: 'processing',
        });

        // Process PDF in background (in production, use a queue like bull)
        processPDF(document._id,req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully. Processing in progress...'
        });

    } catch (error) {
        //Clean up file on error
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// Helper function to process PDF 
const processPDF = async (documentID, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);

        //Create Chunks
        const chunks = chunkText(text, 500,50);

        //Update Document 
        await Document.findByIdAndUpdate(documentID, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });
        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed',
        });
    }
};

//@desc Get all user document
//@route GET/api/documents
//@access Private

export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregrate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
              $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'  
              }
            },
            {
                $addFields: {
                   flashcardCount: { $size: '$flashcardSets' },
                   quizCount: { $size: '$quizzes' }
                }
            },
            {
              $project: {
                extractedText: 0,
                chunks: 0,
                flashcardSets: 0,
                quizzes: 0,
              }
           },
            {
                $sort: { uploadDate: -1 } 
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
};

//@desc Get single document with chunks
//@route GET/api/documents/:id
//@access Private

export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            id: req.params.id,
            userId: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        //Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user.id});
        const quizCount = await quiz.countDocuments({ documentId: document._id, userId: req.user.id });

        //Update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        //Combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });
    } catch (error) { 
        next(error);
    }
};

//@desc Delete document
//@route DELETE/api/documents/:id
//@access Private

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne ({
            _id: req.params.id,
            userId: req,user_id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        //Delete file fro filesystem
        await fs.unlink(document.filePath).catch(() => {});

        //Delete document 
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        next(error); 
    } 
};

