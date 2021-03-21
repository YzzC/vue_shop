<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Order Management</el-breadcrumb-item>
            <el-breadcrumb-item>Order List</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="Please search">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表区域 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="Order number" prop="order_number"></el-table-column>
                <el-table-column label="Order price" prop="order_price"></el-table-column>
                <el-table-column label="Purchase" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status==='1'">Paid</el-tag>
                        <el-tag type="danger" v-else>Unpaid</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="Delivered" prop="is_send"></el-table-column>
                <el-table-column label="Order time" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="Operation">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

        </el-card>

        <!-- 修改地址对话框 -->
        <el-dialog title="Change Address" :visible.sync="addressVisible" width="70%">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="150px">
                <el-form-item label="State/Province" prop="address1">
                    <el-input v-model="addressForm.address1"></el-input>
                </el-form-item>
                <el-form-item label="Detailed" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">Cancel</el-button>
                <el-button type="primary" @click="addressVisible = false">Confirm</el-button>
            </span>
        </el-dialog>

        <!-- 展示物流进度 -->
        <el-dialog title="Delivery" :visible.sync="progressVisible" width="50%">

        </el-dialog>


    </div>
</template>

<script>
    export default {
        data() {
            return {
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                total: 0,
                orderlist: [],
                addressVisible: false,
                addressForm: {
                    address1:'',
                    address2:''
                },
                addressFormRules:{
                    address1:[
                        {required:true, message:'Please enter State/Province', trigger:'blur'}
                    ],
                    address2:[
                        {required:true, message:'Please enter detailed address', trigger:'blur'}
                    ]
                },
                progressVisible:false,
                progressInfo:[]
            }
        },
        created() {
            this.getOrderList()
        },
        methods: {
            async getOrderList() {
                const { data: res } = await this.$http.get(`orders`, { params: this.queryInfo })

                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get orders')
                }
                this.total = res.data.total
                this.orderlist = res.data.goods
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getOrderList()
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getOrderList()
            },
            //展示修改地址对话框
            showBox() {
                this.addressVisible = true
            },
            async showProgressBox(){
                const {data:res} = await this.$http.get(`/kuaidi/1106975712662`)
                if(res.meta.status !== 200){
                    return this.$message.error('Fail to get delivery info')
                }
                this.progressInfo = res.data
                this.progressVisible=true
                console.log(this.progressInfo)
            },
        }
    }
</script>

<style lang="less" scoped>

</style>