import request from '@/utils/request.js'

/**
 * 获取规则编排分页
 */
export const getRuleDesignPage = (pageNo, pageSize, params) => {
  return request({
    url: `warning/ruleDesign/page`,
    method: 'get',
    params: {
      ...params,
      pageNo,
      pageSize,
    }
  })
}

/**
 * 获取规则详情
 */
export const getRule = (id) => {
  return request({
    url: `warning/ruleDesign/detail`,
    method: 'get',
    params: {
      id
    }
  })
}

/**
 * 保存或编辑 - 规则编排
 */
export const submit = (data) => {
  return request({
    url: `warning/ruleDesign/submit`,
    method: 'post',
    data: data
  })
}

/**
 * 删除接入协议
 */
export const remove = (id) => {
  return request({
    url: `warning/ruleDesign/remove?id=`+id,
    method: 'get',
  })
}

/**
 * 运行规则编排
 */
export const runRule = (id) => {
  return request({
    url: `warning/ruleDesign/runRule?id=`+id,
    method: 'get',
  })
}

/**
 * 获取画布左侧节点信息
 */
export const loadNodes = () => {
  return request({
    url: `warning/ruleDesign/loadNodes`,
    method: 'get',
  })
}

/*

import http from '@/utils/http'

export const createRule = (body = {}) => http.post('/rules', body)

// 根据id获取rule
export const getRule = (id) => http.get(`/rules/${id}`)
*/
