from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

import os

def get_llm():
    return ChatMistralAI(
        model="mistral-small-latest",mistral_api_key=os.environ.get("MISTRAL_API_KEY"),temperature=0.3
    )

def split_text(transcript:str)-> list:
    text_splitter=RecursiveCharacterTextSplitter(
        chunk_size = 3000,
        chunk_overlap = 200
    )
    return text_splitter.split_text(transcript)

def summarize(transcript:str)-> str:
    llm=get_llm()

    map_prompt=ChatPromptTemplate.from_messages(
        [
            ("system","Summarize this portion of the transcript in a concise manner."),
            ("human","{text}")
        ]
    )
    map_chain=map_prompt | llm | StrOutputParser()

    chunks=split_text(transcript)
    chunk_summaries=[map_chain.invoke({"text":chunk}) for chunk in chunks]
    
    combined= "\n\n".join(chunk_summaries)

    combine_prompt=ChatPromptTemplate.from_messages(
        [
            ("system","You are a helpful assistant that summarizes transcripts into one final professional summary in bullet points."),
            ("human","{text}")
        ]
    )

    combine_chain=(
        RunnablePassthrough() | RunnableLambda(lambda x: {"text":x}) | combine_prompt | llm | StrOutputParser()
    )

    return combine_chain.invoke(combined)

def generate_title(transcript:str)-> str:
    llm=get_llm()

    title_prompt=ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful assistant that generates a professional title for a transcript. "
                       "Based on the transcript, generate a concise and professional title that accurately reflects the content. "
                       "CRITICAL INSTRUCTION: You MUST return ONLY the title text. Do NOT include markdown formatting, bolding, quotes, conversational padding (e.g. 'Here is the title:'), or reasoning."),
            ("human","{text}")
        ]
    )

    title_chain=(
        RunnablePassthrough() | RunnableLambda(lambda x: {"text":x}) | title_prompt | llm | StrOutputParser()
    )

    return title_chain.invoke(transcript)

