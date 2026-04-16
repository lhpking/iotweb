import request from '@/utils/request.js'

/**
 * 获取计算模型分页
 */
export const getCalcModelPage = (pageNo, pageSize, params) => {
  return request({
    url: `warning/calcModel/page`,
    method: 'get',
    params: {
      ...params,
      pageNo,
      pageSize,
    }
  })
}

/**
 * 获取模型详情
 */
export const getCalcModelDetail = (id) => {
  return request({
    url: `warning/calcModel/detail`,
    method: 'get',
    params: {
      id
    }
  })
}

/**
 * 保存或编辑 - 计算模型
 */
export const submit = (data) => {
  return request({
    url: `warning/calcModel/submit`,
    method: 'post',
    data: data
  })
}

/**
 * 更改状态 - 计算模型
 */
export const updateStatusById = (id) => {
  return request({
    url: `warning/calcModel/updateStatusById`,
    method: 'get',
    params: {
      id
    }
  })
}

/**
 * 删除计算模型
 */
export const remove = (id) => {
  return request({
    url: `warning/calcModel/remove?id=`+id,
    method: 'get',
  })
}
