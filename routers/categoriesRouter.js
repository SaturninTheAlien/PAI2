'use strict';

const express = require('express');
const router = express.Router();
const categoryDao = require("../dao/categoryDao")

const{onClientError, onServerError} = require("../handlers/errorHandler");
const{verifyAuthAdmin} = require("../services/authService");

router.use(express.json());

router.get("/", (req, res) => {
    categoryDao.allCategories().then(categories=>{
        res.status(200).json(categories);
    }).catch(err => onServerError(res, err));
});

router.get("/main_page", (req, res) => {
    categoryDao.getCategoriesOnMainPage().then(categories=>{
        res.status(200).json(categories);
    }).catch(err => onServerError(res, err));
});

router.get('/:id(\\d+)', (req, res) => {
    const pk = Number.parseInt(req.params.id);
    categoryDao.getCategory(pk).then(op=>{
        if(op.success){
            res.status(200).json(op.category);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }

    }).catch(err => onServerError(res, err));
});

router.get('/:id(\\d+)/data', (req, res)=>{

    const pk = Number.parseInt(req.params.id);
    categoryDao.collectCategoryData(pk).then(op=>{
        if(op.success){
            res.status(200).json(op.res);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }

    }).catch(err => onServerError(res, err));
});

router.get('/:id(\\d+)/collect_children', verifyAuthAdmin, (req, res)=>{
    const pk = Number.parseInt(req.params.id);
    categoryDao.getCategoryWithAllChildren(pk).then(op=>{
        if(op.success){
            res.status(200).json(op.categories);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }

    }).catch(err => onServerError(res, err));
});

router.get("/:id(\\d+)/collect_parents", verifyAuthAdmin, (req, res)=>{

    const pk = Number.parseInt(req.params.id);
    categoryDao.getCategoryWithAllParents(pk).then(op=>{
        if(op.success){
            res.status(200).json(op.categories);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }

    }).catch(err => onServerError(res, err));
});


router.get("/:id(\\d+)/attributes",verifyAuthAdmin, (req, res)=>{
    const pk = Number.parseInt(req.params.id);
    categoryDao.collectAllCategoryAttributes(pk).then(op=>{
        if(op.success){
            res.status(200).json(op.attributes);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }

    }).catch(err => onServerError(res, err));
});

router.post("/",verifyAuthAdmin, (req, res) => {
    categoryDao.postCategory(req.body).then(op=>{
        if(op.success){
            res.status(201).json(op.category);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }
    }).catch(err => onServerError(res, err));
});


router.put('/:id(\\d+)', verifyAuthAdmin, (req, res) => {
    const pk = Number.parseInt(req.params.id);
    categoryDao.putCategory(pk, req.body).then(op=>{
        if(op.success){
            res.status(200).json(op.category);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }
    }).catch(err => onServerError(res, err));
});

router.delete('/:id(\\d+)', verifyAuthAdmin, (req, res) => {
    const pk = Number.parseInt(req.params.id);
    categoryDao.deleteCategory(pk).then(op=>{
        if(op.success){
            res.sendStatus(204);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }
    }).catch(err => onServerError(res, err));
});

module.exports = router